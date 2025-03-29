import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
        console.error("Error creating contact submission:", error);
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
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ success: false, error: "Failed to retrieve contact submissions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
