import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { scheduleFileCleanup } from "./utils/fileCleanup.js";
import dotenv from "dotenv";
import { logger } from "./logger";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      logger.info(logLine);
    }
  });

  next();
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  
  // Log additional error details in development
  if (process.env.NODE_ENV === "development") {
    logger.error("Error details:", {
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    });
  }
  
  res.status(status).json({
    success: false,
    error: message,
  });
});

// Register routes
const startServer = async () => {
  try {
    logger.info("Starting server initialization...");
    
    // Initialize file cleanup scheduler
    scheduleFileCleanup();
    logger.info("File cleanup scheduler initialized");

    // Register routes
    logger.info("Registering routes...");
    const server = await registerRoutes(app);
    logger.info("Routes registered successfully");

    // Setup Vite development server
    logger.info("Setting up Vite development server...");
    await setupVite(app, server);
    logger.info("Vite development server setup complete");

    // Start the server
    logger.info(`Attempting to start server on port ${port}...`);
    server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    // Handle server errors
    server.on("error", (error: Error) => {
      logger.error("Server error:", error);
      process.exit(1);
    });

    // Handle process termination
    process.on("SIGTERM", () => {
      logger.info("Received SIGTERM. Shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      logger.info("Received SIGINT. Shutting down gracefully...");
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
