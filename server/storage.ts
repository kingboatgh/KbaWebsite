import { users, type User, type InsertUser, contactSubmissions, type ContactSubmission, type InsertContact, blogPosts, type BlogPost, type InsertBlogPost, blogComments, type BlogComment, type InsertBlogComment } from "@shared/schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { logger } from "./logger";
import fs from "fs";
import path from "path";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  validatePassword(user: User, password: string): Promise<boolean>;
  generatePasswordResetToken(email: string): Promise<string | null>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  // Contact methods
  createContactSubmission(submission: InsertContact): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;

  // Blog Post methods
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: InsertBlogPost): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  getBlogPosts(params: {
    page?: number;
    limit?: number;
    status?: "draft" | "published";
    search?: string;
    category?: string;
    tag?: string;
  }): Promise<{ posts: BlogPost[]; total: number }>;
  getFeaturedBlogPosts(limit?: number): Promise<BlogPost[]>;
  createOrUpdateBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getCategories(): Promise<string[]>;
  getTags(): Promise<string[]>;

  // Blog Comment methods
  createBlogComment(comment: InsertBlogComment): Promise<BlogComment>;
  getBlogComments(postId: number): Promise<BlogComment[]>;
  deleteBlogComment(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private passwordResetTokens: Map<string, { userId: number; expiresAt: Date }>;
  public contactSubmissions: Map<number, ContactSubmission>;
  private blogPosts: Map<number, BlogPost>;
  private blogComments: Map<number, BlogComment>;
  private contactSubmissionCurrentId: number;
  private blogPostCurrentId: number;
  private blogCommentCurrentId: number;
  private categories: Set<string>;
  private tags: Set<string>;
  private nextBlogPostId: number;
  private nextUserId: number;
  private fileCleanupScheduler: NodeJS.Timeout;
  private uploadDir: string;

  constructor() {
    this.users = new Map();
    this.passwordResetTokens = new Map();
    this.contactSubmissions = new Map();
    this.blogPosts = new Map();
    this.blogComments = new Map();
    this.contactSubmissionCurrentId = 1;
    this.blogPostCurrentId = 1;
    this.blogCommentCurrentId = 1;
    this.categories = new Set();
    this.tags = new Set();
    this.nextBlogPostId = 1;
    this.nextUserId = 1;
    this.uploadDir = path.join(process.cwd(), "uploads");
    this.fileCleanupScheduler = setInterval(() => this.cleanupUnusedFiles(), 24 * 60 * 60 * 1000);
    this.initializeDefaultAdmin();
  }

  private async initializeDefaultAdmin() {
    try {
      // Check if admin user exists
      const adminExists = Array.from(this.users.values()).some(user => user.role === "admin");
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const adminUser: User = {
          id: 1,
          username: "admin",
          email: "admin@example.com",
          password: hashedPassword,
          role: "admin",
        };
        this.users.set(1, adminUser);
        this.nextUserId = 2;
        logger.info("Default admin user created:", {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
        });
      }
    } catch (error) {
      logger.error("Error initializing default admin:", error);
      throw new Error("Failed to initialize default admin user");
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      return this.users.get(id);
    } catch (error) {
      logger.error("Error getting user by ID:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = Array.from(this.users.values()).find(u => u.email === email);
      if (!user) {
        logger.debug("User not found:", { email });
        return null;
      }
      return user;
    } catch (error) {
      logger.error("Error getting user by email:", error);
      return null;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const id = this.nextUserId++;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      const newUser: User = { 
        ...user, 
        id,
        password: hashedPassword,
        role: user.role || "editor"
      };
      this.users.set(id, newUser);
      logger.info("User created successfully:", { id: newUser.id, email: newUser.email });
      return newUser;
    } catch (error) {
      logger.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    try {
      const existingUser = this.users.get(id);
      if (!existingUser) {
        throw new Error("User not found");
      }

      const updatedUser: User = {
        ...existingUser,
        ...user,
        id, // Ensure ID cannot be changed
      };

      this.users.set(id, updatedUser);
      logger.info("User updated successfully:", { id: updatedUser.id, email: updatedUser.email });
      return updatedUser;
    } catch (error) {
      logger.error("Error updating user:", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      if (!this.users.has(id)) {
        throw new Error("User not found");
      }
      this.users.delete(id);
      logger.info("User deleted successfully:", { id });
    } catch (error) {
      logger.error("Error deleting user:", error);
      throw error;
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, user.password);
      logger.debug("Password validation result:", { 
        userId: user.id, 
        email: user.email, 
        isValid 
      });
      return isValid;
    } catch (error) {
      logger.error("Error validating password:", error);
      return false;
    }
  }

  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    this.passwordResetTokens.set(token, {
      userId: user.id,
      expiresAt,
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetData = this.passwordResetTokens.get(token);
    if (!resetData) {
      return false;
    }

    if (resetData.expiresAt < new Date()) {
      this.passwordResetTokens.delete(token);
      return false;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await this.updateUser(resetData.userId, { password: hashedPassword });
    this.passwordResetTokens.delete(token);

    return true;
  }

  async createContactSubmission(submission: InsertContact): Promise<ContactSubmission> {
    const id = this.contactSubmissionCurrentId++;
    const createdAt = new Date().toISOString();
    const contactSubmission: ContactSubmission = { 
      ...submission, 
      id, 
      createdAt
    };
    this.contactSubmissions.set(id, contactSubmission);
    return contactSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values());
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(post => post.slug === slug);
  }

  private generateUniqueSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    
    while (Array.from(this.blogPosts.values()).some(post => post.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    try {
      const newPost: BlogPost = {
        id: this.blogPostCurrentId++,
        ...post,
        slug: post.slug || this.generateUniqueSlug(post.title),
        status: post.status || "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: post.status === "published" ? new Date().toISOString() : null,
        excerpt: post.excerpt || null,
        featuredImage: post.featuredImage || null,
        categories: post.categories ? JSON.stringify(post.categories) : null,
        tags: post.tags ? JSON.stringify(post.tags) : null,
        authorId: post.authorId || null,
        viewCount: post.viewCount || 0,
        likes: post.likes || 0,
      };
      this.blogPosts.set(newPost.id, newPost);
      return newPost;
    } catch (error) {
      console.error("Error creating blog post:", error);
      throw new Error("Failed to create blog post");
    }
  }

  async updateBlogPost(id: number, post: InsertBlogPost): Promise<BlogPost> {
    try {
      const existingPost = this.blogPosts.get(id);
      if (!existingPost) {
        throw new Error("Blog post not found");
      }

      // Only generate a new slug if the title has changed
      const slug = post.title !== existingPost.title 
        ? this.generateUniqueSlug(post.title)
        : existingPost.slug;

      const updatedPost: BlogPost = {
        ...existingPost,
        ...post,
        slug,
        status: post.status || existingPost.status,
        updatedAt: new Date().toISOString(),
        publishedAt: post.status === "published" ? new Date().toISOString() : existingPost.publishedAt,
        categories: post.categories ? JSON.stringify(post.categories) : existingPost.categories,
        tags: post.tags ? JSON.stringify(post.tags) : existingPost.tags,
        authorId: post.authorId ?? existingPost.authorId,
        viewCount: post.viewCount ?? existingPost.viewCount,
        likes: post.likes ?? existingPost.likes,
      };
      this.blogPosts.set(id, updatedPost);
      return updatedPost;
    } catch (error) {
      console.error("Error updating blog post:", error);
      throw error;
    }
  }

  async deleteBlogPost(id: number): Promise<void> {
    this.blogPosts.delete(id);
  }

  async getBlogPosts(params: {
    page?: number;
    limit?: number;
    status?: "draft" | "published";
    search?: string;
    category?: string;
    tag?: string;
  }): Promise<{ posts: BlogPost[]; total: number }> {
    try {
      let posts = Array.from(this.blogPosts.values());

      // Apply filters
      if (params.status) {
        posts = posts.filter(post => post.status === params.status);
      }
      if (params.search && params.search.trim()) {
        const searchTerm = params.search.toLowerCase().trim();
        posts = posts.filter(post => 
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm) ||
          post.excerpt?.toLowerCase().includes(searchTerm)
        );
      }
      if (params.category) {
        posts = posts.filter(post => {
          if (!post.categories) return false;
          try {
            const categories = JSON.parse(post.categories) as string[];
            return categories.includes(params.category!);
          } catch (error) {
            console.error(`Error parsing categories for post ${post.id}:`, error);
            return false;
          }
        });
      }
      if (params.tag) {
        posts = posts.filter(post => {
          if (!post.tags) return false;
          try {
            const tags = JSON.parse(post.tags) as string[];
            return tags.includes(params.tag!);
          } catch (error) {
            console.error(`Error parsing tags for post ${post.id}:`, error);
            return false;
          }
        });
      }

      // Sort by published date (newest first)
      posts.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt);
        const dateB = new Date(b.publishedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      const total = posts.length;

      // Apply pagination
      if (params.page && params.limit) {
        const start = (params.page - 1) * params.limit;
        const end = start + params.limit;
        posts = posts.slice(start, end);
      }

      return { posts, total };
    } catch (error) {
      console.error("Error getting blog posts:", error);
      throw new Error("Failed to get blog posts");
    }
  }

  async getFeaturedBlogPosts(limit: number = 5): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.status === "published")
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt);
        const dateB = new Date(b.publishedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  async createOrUpdateBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    // Try to find an existing post with the same title
    const existingPost = Array.from(this.blogPosts.values()).find(
      p => p.title === post.title && p.status === "draft"
    );

    if (existingPost) {
      // Update the existing post
      return this.updateBlogPost(existingPost.id, post);
    } else {
      // Create a new post
      return this.createBlogPost(post);
    }
  }

  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> {
    const newComment: BlogComment = {
      id: this.blogCommentCurrentId++,
      ...comment,
      createdAt: new Date().toISOString(),
    };
    this.blogComments.set(newComment.id, newComment);
    return newComment;
  }

  async getBlogComments(postId: number): Promise<BlogComment[]> {
    let comments = Array.from(this.blogComments.values())
      .filter(comment => comment.postId === postId);

    return comments.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async deleteBlogComment(id: number): Promise<void> {
    this.blogComments.delete(id);
  }

  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    for (const post of this.blogPosts.values()) {
      if (post.categories) {
        try {
          const postCategories = JSON.parse(post.categories) as string[];
          postCategories.forEach(category => categories.add(category));
        } catch (error) {
          console.error(`Error parsing categories for post ${post.id}:`, error);
        }
      }
    }
    return Array.from(categories).sort();
  }

  async getTags(): Promise<string[]> {
    const tags = new Set<string>();
    for (const post of this.blogPosts.values()) {
      if (post.tags) {
        try {
          const postTags = JSON.parse(post.tags) as string[];
          postTags.forEach(tag => tags.add(tag));
        } catch (error) {
          console.error(`Error parsing tags for post ${post.id}:`, error);
        }
      }
    }
    return Array.from(tags).sort();
  }

  private async cleanupUnusedFiles() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        return;
      }

      const files = fs.readdirSync(this.uploadDir);
      const usedFiles = new Set<string>();

      // Collect all file paths used in blog posts
      for (const post of this.blogPosts.values()) {
        if (post.featuredImage) {
          const fileName = path.basename(post.featuredImage);
          usedFiles.add(fileName);
        }
      }

      // Remove unused files
      for (const file of files) {
        if (!usedFiles.has(file)) {
          const filePath = path.join(this.uploadDir, file);
          fs.unlinkSync(filePath);
          logger.info("Cleaned up unused file:", { file });
        }
      }
    } catch (error) {
      logger.error("Error cleaning up unused files:", error);
    }
  }

  cleanup() {
    clearInterval(this.fileCleanupScheduler);
  }
}

export const storage = new MemStorage();
