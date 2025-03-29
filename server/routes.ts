import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertBlogPostSchema, insertBlogCommentSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    log("Initializing routes...");
    
    // Contact form submission
    app.post("/api/contact", async (req: Request, res: Response) => {
      try {
        const contactData = insertContactSchema.parse(req.body);
        const submission = await storage.createContactSubmission(contactData);
        res.status(201).json({ success: true, data: submission });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ success: false, error: validationError.message });
        } else {
          log(`Error creating contact submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
          res.status(500).json({ success: false, error: "Failed to submit contact form" });
        }
      }
    });

    // Get all contact submissions (admin only in a real app)
    app.get("/api/contact", async (req: Request, res: Response) => {
      try {
        const submissions = await storage.getContactSubmissions();
        res.status(200).json({ success: true, data: submissions });
      } catch (error) {
        log(`Error fetching contact submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve contact submissions" });
      }
    });

    // Blog Post routes
    app.post("/api/blog/posts", async (req: Request, res: Response) => {
      try {
        const postData = insertBlogPostSchema.parse(req.body);
        const post = await storage.createBlogPost(postData);
        res.status(201).json({ success: true, data: post });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ success: false, error: validationError.message });
        } else {
          log(`Error creating blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
          res.status(500).json({ success: false, error: "Failed to create blog post" });
        }
      }
    });

    app.get("/api/blog/posts", async (req: Request, res: Response) => {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;
        const category = req.query.category as string;
        const tag = req.query.tag as string;
        const authorId = parseInt(req.query.authorId as string);

        const result = await storage.getBlogPosts({
          page,
          limit,
          status,
          category,
          tag,
          authorId,
        });
        res.status(200).json({ success: true, data: result });
      } catch (error) {
        log(`Error fetching blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve blog posts" });
      }
    });

    app.get("/api/blog/posts/:id", async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const post = await storage.getBlogPost(id);
        if (!post) {
          res.status(404).json({ success: false, error: "Blog post not found" });
          return;
        }
        res.status(200).json({ success: true, data: post });
      } catch (error) {
        log(`Error fetching blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve blog post" });
      }
    });

    app.get("/api/blog/posts/slug/:slug", async (req: Request, res: Response) => {
      try {
        const post = await storage.getBlogPostBySlug(req.params.slug);
        if (!post) {
          res.status(404).json({ success: false, error: "Blog post not found" });
          return;
        }
        res.status(200).json({ success: true, data: post });
      } catch (error) {
        log(`Error fetching blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve blog post" });
      }
    });

    app.put("/api/blog/posts/:id", async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const postData = insertBlogPostSchema.partial().parse(req.body);
        const post = await storage.updateBlogPost(id, postData);
        res.status(200).json({ success: true, data: post });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ success: false, error: validationError.message });
        } else {
          log(`Error updating blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
          res.status(500).json({ success: false, error: "Failed to update blog post" });
        }
      }
    });

    app.delete("/api/blog/posts/:id", async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteBlogPost(id);
        res.status(204).send();
      } catch (error) {
        log(`Error deleting blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to delete blog post" });
      }
    });

    app.get("/api/blog/featured", async (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 5;
        const posts = await storage.getFeaturedBlogPosts(limit);
        res.status(200).json({ success: true, data: posts });
      } catch (error) {
        log(`Error fetching featured blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve featured blog posts" });
      }
    });

    // Blog Comment routes
    app.post("/api/blog/posts/:postId/comments", async (req: Request, res: Response) => {
      try {
        const postId = parseInt(req.params.postId);
        const commentData = insertBlogCommentSchema.parse({
          ...req.body,
          postId,
        });
        const comment = await storage.createBlogComment(commentData);
        res.status(201).json({ success: true, data: comment });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ success: false, error: validationError.message });
        } else {
          log(`Error creating blog comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
          res.status(500).json({ success: false, error: "Failed to create blog comment" });
        }
      }
    });

    app.get("/api/blog/posts/:postId/comments", async (req: Request, res: Response) => {
      try {
        const postId = parseInt(req.params.postId);
        const status = req.query.status as string;
        const comments = await storage.getBlogComments(postId, { status });
        res.status(200).json({ success: true, data: comments });
      } catch (error) {
        log(`Error fetching blog comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve blog comments" });
      }
    });

    app.put("/api/blog/comments/:id/status", async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        if (!status || !["pending", "approved", "rejected"].includes(status)) {
          res.status(400).json({ success: false, error: "Invalid status" });
          return;
        }
        const comment = await storage.updateCommentStatus(id, status);
        res.status(200).json({ success: true, data: comment });
      } catch (error) {
        log(`Error updating comment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to update comment status" });
      }
    });

    app.delete("/api/blog/comments/:id", async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteBlogComment(id);
        res.status(204).send();
      } catch (error) {
        log(`Error deleting blog comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to delete blog comment" });
      }
    });

    log("Creating HTTP server...");
    const httpServer = createServer(app);
    log("HTTP server created successfully");

    return httpServer;
  } catch (error) {
    log(`Failed to register routes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    if (error instanceof Error && error.stack) {
      log(`Stack trace: ${error.stack}`);
    }
    throw error;
  }
}
