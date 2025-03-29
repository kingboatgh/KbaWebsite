import { users, type User, type InsertUser, contactSubmissions, type ContactSubmission, type InsertContact, blogPosts, type BlogPost, type InsertBlogPost, blogComments, type BlogComment, type InsertBlogComment } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactSubmission(submission: InsertContact): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;

  // Blog Post methods
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  getBlogPosts(options?: { 
    page?: number; 
    limit?: number; 
    status?: string;
    category?: string;
    tag?: string;
    authorId?: number;
  }): Promise<{ posts: BlogPost[]; total: number }>;
  getFeaturedBlogPosts(limit?: number): Promise<BlogPost[]>;

  // Blog Comment methods
  getBlogComments(postId: number, options?: { status?: string }): Promise<BlogComment[]>;
  createBlogComment(comment: InsertBlogComment): Promise<BlogComment>;
  updateCommentStatus(id: number, status: string): Promise<BlogComment>;
  deleteBlogComment(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private blogPosts: Map<number, BlogPost>;
  private blogComments: Map<number, BlogComment>;
  userCurrentId: number;
  contactCurrentId: number;
  blogPostCurrentId: number;
  blogCommentCurrentId: number;

  constructor() {
    this.users = new Map();
    this.contactSubmissions = new Map();
    this.blogPosts = new Map();
    this.blogComments = new Map();
    this.userCurrentId = 1;
    this.contactCurrentId = 1;
    this.blogPostCurrentId = 1;
    this.blogCommentCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContactSubmission(submission: InsertContact): Promise<ContactSubmission> {
    const id = this.contactCurrentId++;
    const createdAt = new Date().toISOString();
    const contactSubmission: ContactSubmission = { 
      ...submission, 
      id, 
      createdAt,
      company: submission.company || null
    };
    this.contactSubmissions.set(id, contactSubmission);
    return contactSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values());
  }

  // Blog Post methods
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(post => post.slug === slug);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const newPost: BlogPost = {
      id: this.blogPostCurrentId++,
      ...post,
      status: post.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: post.status === "published" ? new Date() : null,
      excerpt: post.excerpt || null,
      authorId: post.authorId || null,
      featuredImage: post.featuredImage || null,
      metaDescription: post.metaDescription || null,
      metaKeywords: post.metaKeywords || null,
      categories: post.categories || null,
      tags: post.tags || null,
      isFeatured: post.isFeatured || false,
    };
    this.blogPosts.set(newPost.id, newPost);
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const existingPost = this.blogPosts.get(id);
    if (!existingPost) {
      throw new Error("Blog post not found");
    }

    const updatedPost: BlogPost = {
      ...existingPost,
      ...post,
      status: post.status || existingPost.status,
      updatedAt: new Date(),
      publishedAt: post.status === "published" ? new Date() : existingPost.publishedAt,
    };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    this.blogPosts.delete(id);
  }

  async getBlogPosts(options: { 
    page?: number; 
    limit?: number; 
    status?: string;
    category?: string;
    tag?: string;
    authorId?: number;
  } = {}): Promise<{ posts: BlogPost[]; total: number }> {
    let posts = Array.from(this.blogPosts.values());

    // Apply filters
    if (options.status) {
      posts = posts.filter(post => post.status === options.status);
    }
    if (options.category) {
      posts = posts.filter(post => post.categories?.includes(options.category!));
    }
    if (options.tag) {
      posts = posts.filter(post => post.tags?.includes(options.tag!));
    }
    if (options.authorId) {
      posts = posts.filter(post => post.authorId === options.authorId);
    }

    // Sort by published date (newest first)
    posts.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt || new Date(0);
      const dateB = b.publishedAt || b.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    const total = posts.length;

    // Apply pagination
    if (options.page && options.limit) {
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      posts = posts.slice(start, end);
    }

    return { posts, total };
  }

  async getFeaturedBlogPosts(limit: number = 5): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.isFeatured && post.status === "published")
      .sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt || new Date(0);
        const dateB = b.publishedAt || b.createdAt || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limit);
  }

  // Blog Comment methods
  async getBlogComments(postId: number, options: { status?: string } = {}): Promise<BlogComment[]> {
    let comments = Array.from(this.blogComments.values())
      .filter(comment => comment.postId === postId);

    if (options.status) {
      comments = comments.filter(comment => comment.status === options.status);
    }

    return comments.sort((a, b) => {
      const dateA = a.createdAt || new Date(0);
      const dateB = b.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async createBlogComment(comment: InsertBlogComment): Promise<BlogComment> {
    const newComment: BlogComment = {
      id: this.blogCommentCurrentId++,
      ...comment,
      status: comment.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      postId: comment.postId || null,
    };
    this.blogComments.set(newComment.id, newComment);
    return newComment;
  }

  async updateCommentStatus(id: number, status: string): Promise<BlogComment> {
    const comment = this.blogComments.get(id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    const updatedComment: BlogComment = {
      ...comment,
      status,
      updatedAt: new Date(),
    };
    this.blogComments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteBlogComment(id: number): Promise<void> {
    this.blogComments.delete(id);
  }
}

export const storage = new MemStorage();
