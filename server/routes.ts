import express, { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertBlogPostSchema, insertBlogCommentSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { logger } from "./logger";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
      };
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created upload directory: ${uploadDir}`);
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to delete file
const deleteFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted file: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Error deleting file ${filePath}:`, error);
  }
};

// JWT verification middleware
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Invalid token format",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: number;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

// Admin-only middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }
  next();
};

// Rate limiting middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: "Too many login attempts. Please try again later."
  }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per window
  message: {
    success: false,
    error: "Too many contact form submissions. Please try again later."
  }
});

const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per window
  message: {
    success: false,
    error: "Too many comment submissions. Please try again later."
  }
});

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many login attempts. Please try again later.",
});

// Authentication middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.error("Authentication failed: No token provided");
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as { userId: number; role: string };
    req.user = user;
    next();
  } catch (error) {
    logger.error("Authentication failed: Invalid token");
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    logger.info("Initializing routes...");
    
    // Contact form submission
    app.post("/api/contact", contactLimiter, async (req: Request, res: Response) => {
      try {
        const contactData = insertContactSchema.parse(req.body);
        const submission = await storage.createContactSubmission(contactData);
        res.status(201).json({ success: true, data: submission });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ success: false, error: error.errors });
        } else {
          logger.error("Error creating contact submission:", error);
          res.status(500).json({ success: false, error: "Failed to submit contact form" });
        }
      }
    });

    // Get all contact submissions (admin only in a real app)
    app.get("/api/contact", verifyToken, requireAdmin, async (req: Request, res: Response) => {
      try {
        const submissions = await storage.getContactSubmissions();
        res.status(200).json({ success: true, data: submissions });
      } catch (error) {
        logger.error(`Error fetching contact submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve contact submissions" });
      }
    });

    // Blog Post routes
    app.post("/api/blog/posts", verifyToken, async (req: Request, res: Response) => {
      try {
        const postData = insertBlogPostSchema.parse({
          ...req.body,
          authorId: req.user?.userId || null,
        });
        const newPost = await storage.createBlogPost(postData);
        res.json({ success: true, data: newPost });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ success: false, error: error.errors });
        } else {
          logger.error("Error creating blog post:", error);
          res.status(500).json({ success: false, error: "Internal server error" });
        }
      }
    });

    app.get("/api/blog/posts", async (req: Request, res: Response) => {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as "draft" | "published" | undefined;
        const search = req.query.search as string | undefined;
        const category = req.query.category as string | undefined;
        const tag = req.query.tag as string | undefined;

        const result = await storage.getBlogPosts({
          page,
          limit,
          status,
          search,
          category,
          tag,
        });

        res.json({ success: true, data: result });
      } catch (error) {
        logger.error("Error fetching blog posts:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
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
        logger.error(`Error fetching blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        logger.error(`Error fetching blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve blog post" });
      }
    });

    app.put("/api/blog/posts/:id", verifyToken, async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const postData = insertBlogPostSchema.parse({
          ...req.body,
          authorId: req.user?.userId || null,
        });
        const updatedPost = await storage.updateBlogPost(id, postData);
        res.json({ success: true, data: updatedPost });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ success: false, error: error.errors });
        } else if (error instanceof Error && error.message === "Blog post not found") {
          res.status(404).json({ success: false, error: "Blog post not found" });
        } else {
          logger.error("Error updating blog post:", error);
          res.status(500).json({ success: false, error: "Internal server error" });
        }
      }
    });

    app.delete("/api/blog/posts/:id", verifyToken, async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        const post = await storage.getBlogPost(id);
        if (!post) {
          res.status(404).json({ success: false, error: "Blog post not found" });
          return;
        }

        // Delete associated image if exists
        if (post.featuredImage) {
          const imagePath = path.join(__dirname, "../public", post.featuredImage);
          deleteFile(imagePath);
        }

        await storage.deleteBlogPost(id);
        res.status(204).send();
      } catch (error) {
        logger.error(`Error deleting blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to delete blog post" });
      }
    });

    app.get("/api/blog/featured", async (req: Request, res: Response) => {
      try {
        const limit = parseInt(req.query.limit as string) || 5;
        const posts = await storage.getFeaturedBlogPosts(limit);
        res.status(200).json({ success: true, data: posts });
      } catch (error) {
        logger.error(`Error fetching featured blog posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve featured blog posts" });
      }
    });

    // Blog Comment routes
    app.post("/api/blog/posts/:postId/comments", commentLimiter, async (req: Request, res: Response) => {
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
          res.status(400).json({ success: false, error: error.errors });
        } else {
          logger.error("Error creating blog comment:", error);
          res.status(500).json({ success: false, error: "Failed to create blog comment" });
        }
      }
    });

    app.get("/api/blog/posts/:postId/comments", async (req: Request, res: Response) => {
      try {
        const postId = parseInt(req.params.postId);
        const comments = await storage.getBlogComments(postId);
        res.status(200).json({ success: true, data: comments });
      } catch (error) {
        logger.error(`Error fetching blog comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve blog comments" });
      }
    });

    app.delete("/api/blog/comments/:id", async (req: Request, res: Response) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteBlogComment(id);
        res.status(204).send();
      } catch (error) {
        logger.error(`Error deleting blog comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to delete blog comment" });
      }
    });

    // Image upload route
    app.post("/api/upload", upload.single("image"), async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            error: "No file uploaded" 
          });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        res.status(201).json({ 
          success: true, 
          data: { 
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size
          } 
        });
      } catch (error) {
        logger.error("Error uploading file:", error);
        // Clean up the uploaded file if there was an error
        if (req.file) {
          deleteFile(path.join(uploadDir, req.file.filename));
        }
        res.status(500).json({ 
          success: false, 
          error: "Failed to upload file" 
        });
      }
    });

    // Related posts endpoint
    app.get("/api/blog/posts/related/:slug", async (req: Request, res: Response) => {
      try {
        const currentPost = await storage.getBlogPostBySlug(req.params.slug);
        if (!currentPost) {
          res.status(404).json({ success: false, error: "Blog post not found" });
          return;
        }

        // Get all published posts
        const { posts } = await storage.getBlogPosts({ status: "published" });
        
        // Filter out the current post
        const relatedPosts = posts
          .filter(post => post.id !== currentPost.id)
          .slice(0, 3); // Limit to 3 related posts

        res.status(200).json({ success: true, data: relatedPosts });
      } catch (error) {
        logger.error(`Error fetching related posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ success: false, error: "Failed to retrieve related posts" });
      }
    });

    // Auto-save blog post
    app.post("/api/blog/posts/autosave", async (req: Request, res: Response) => {
      try {
        const postData = insertBlogPostSchema.parse(req.body);
        const post = await storage.createOrUpdateBlogPost(postData);
        res.json({ success: true, data: post });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ success: false, error: error.errors });
        } else {
          logger.error("Error auto-saving blog post:", error);
          res.status(500).json({ success: false, error: "Internal server error" });
        }
      }
    });

    // Login route
    app.post("/api/auth/login", authLimiter, async (req, res) => {
      try {
        // Validate request body
        const validatedData = loginSchema.parse(req.body);
        logger.info("Login attempt:", { email: validatedData.email });

        // Get user
        const user = await storage.getUserByEmail(validatedData.email);
        if (!user) {
          logger.warn("Login failed: User not found", { email: validatedData.email });
          return res.status(401).json({ 
            success: false, 
            message: "Invalid email or password" 
          });
        }

        // Validate password
        const isValidPassword = await storage.validatePassword(user, validatedData.password);
        if (!isValidPassword) {
          logger.warn("Login failed: Invalid password", { email: validatedData.email });
          return res.status(401).json({ 
            success: false, 
            message: "Invalid email or password" 
          });
        }

        // Generate token
        const token = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "24h" }
        );

        // Log successful login
        logger.info("Login successful:", { 
          email: user.email, 
          role: user.role,
          userId: user.id 
        });

        // Send response
        res.json({
          success: true,
          data: {
            token,
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
            },
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.warn("Login failed: Validation error", { 
            email: req.body.email,
            errors: error.errors 
          });
          return res.status(400).json({ 
            success: false, 
            message: "Invalid input",
            errors: error.errors 
          });
        }
        
        logger.error("Login error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Internal server error" 
        });
      }
    });

    // Token refresh endpoint
    app.post("/api/auth/refresh", async (req, res) => {
      try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
          return res.status(400).json({
            success: false,
            error: "Refresh token is required",
          });
        }

        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
        ) as { userId: number };

        const user = await storage.getUser(decoded.userId);
        if (!user) {
          return res.status(401).json({
            success: false,
            error: "Invalid refresh token",
          });
        }

        // Generate new access token
        const accessToken = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "15m" }
        );

        res.json({
          success: true,
          accessToken,
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: "Invalid refresh token",
        });
      }
    });

    // Blog routes
    app.get("/api/blog/categories", async (req: Request, res: Response) => {
      try {
        const categories = await storage.getCategories();
        res.json({
          success: true,
          data: categories,
        });
      } catch (error) {
        logger.error("Error fetching categories:");
        res.status(500).json({
          success: false,
          error: "Failed to fetch categories",
        });
      }
    });

    app.get("/api/blog/tags", async (req: Request, res: Response) => {
      try {
        const tags = await storage.getTags();
        res.json({
          success: true,
          data: tags,
        });
      } catch (error) {
        logger.error("Error fetching tags:");
        res.status(500).json({
          success: false,
          error: "Failed to fetch tags",
        });
      }
    });

    app.post("/api/newsletter/subscribe", async (req: Request, res: Response) => {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({
            success: false,
            error: "Email is required",
          });
        }

        // In a real app, you would:
        // 1. Validate email format
        // 2. Check if already subscribed
        // 3. Add to newsletter service (e.g., Mailchimp)
        // 4. Send confirmation email
        
        res.json({
          success: true,
          message: "Successfully subscribed to newsletter",
        });
      } catch (error) {
        logger.error("Newsletter subscription error:");
        res.status(500).json({
          success: false,
          error: "Failed to subscribe to newsletter",
        });
      }
    });

    logger.info("Creating HTTP server...");
    const httpServer = createServer(app);
    logger.info("HTTP server created successfully");

    return httpServer;
  } catch (error) {
    logger.error("Error registering routes:");
    throw error;
  }
}