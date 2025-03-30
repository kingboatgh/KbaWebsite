import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import blogRoutes from "./routes/blog.js";
import uploadRoutes from "./routes/upload.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import { scheduleFileCleanup } from "./utils/fileCleanup.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

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

      log(logLine);
    }
  });

  next();
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  // Log the error but don't throw it
  log(`Error: ${message}`);
  if (err.stack) {
    log(`Stack trace: ${err.stack}`);
  }
});

// API Routes
app.use("/api/blog", blogRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Development server setup
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });

  app.use(vite.middlewares);
} else {
  // Serve static files in production
  app.use(express.static(path.join(__dirname, "../dist/client")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/client/index.html"));
  });
}

const startServer = async () => {
  try {
    log("Starting server initialization...");
    
    // Schedule file cleanup
    scheduleFileCleanup();
    log("File cleanup scheduler initialized");
    
    log("Registering routes...");
    const server = await registerRoutes(app);
    log("Routes registered successfully");

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      log("Setting up Vite development server...");
      await setupVite(app, server);
      log("Vite development server setup complete");
    } else {
      log("Setting up static file serving...");
      serveStatic(app);
      log("Static file serving setup complete");
    }

    // ALWAYS serve the app on port 5500
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    
    log(`Attempting to start server on port ${port}...`);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server is running on port ${port}`);
    }).on('error', (err) => {
      log(`Failed to start server: ${err.message}`);
      if (err.stack) {
        log(`Stack trace: ${err.stack}`);
      }
      process.exit(1);
    });
  } catch (error) {
    log(`Failed to initialize server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    if (error instanceof Error && error.stack) {
      log(`Stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
};

// Handle process termination gracefully
process.on('SIGTERM', () => {
  log('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

startServer();
