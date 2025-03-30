import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
});

export const contactSubmissions = sqliteTable("contact_submissions", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

export const insertContactSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Blog Post Schema
export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  publishedAt: text("published_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  categories: text("categories"),
  tags: text("tags"),
  authorId: integer("author_id").references(() => users.id),
  viewCount: integer("view_count").default(0),
  likes: integer("likes").default(0),
});

// Blog Comments Schema
export const blogComments = sqliteTable("blog_comments", {
  id: integer("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => blogPosts.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Zod schemas for validation
export const insertBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  slug: z.string().min(1, "Slug is required").max(255, "Slug is too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500, "Excerpt is too long").optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: z.string().optional(),
  featuredImage: z.string().optional(),
  categories: z.array(z.string().min(1, "Category cannot be empty")).max(5, "Too many categories").optional(),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).max(10, "Too many tags").optional(),
  authorId: z.number().nullable().optional(),
  viewCount: z.number().min(0).optional(),
  likes: z.number().min(0).optional(),
});

export const insertBlogCommentSchema = z.object({
  postId: z.number(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  content: z.string().min(1, "Comment is required"),
});

// Types
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogComment = typeof blogComments.$inferSelect;
export type InsertBlogComment = typeof blogComments.$inferInsert;
