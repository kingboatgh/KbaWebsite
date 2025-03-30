import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "../db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../../uploads");

export const cleanupUnusedFiles = async () => {
  try {
    // Get all files in uploads directory
    const files = fs.readdirSync(uploadsDir);

    // Get all image URLs from the database
    const result = await db.query(
      "SELECT featured_image FROM blog_posts WHERE featured_image IS NOT NULL"
    );
    const usedImages = new Set(
      result.rows.map((row) => path.basename(row.featured_image))
    );

    // Delete unused files
    for (const file of files) {
      if (!usedImages.has(file)) {
        const filePath = path.join(uploadsDir, file);
        fs.unlinkSync(filePath);
        console.log(`Deleted unused file: ${file}`);
      }
    }
  } catch (error) {
    console.error("Error cleaning up files:", error);
  }
};

// Run cleanup daily
export const scheduleFileCleanup = () => {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  setInterval(cleanupUnusedFiles, ONE_DAY);
}; 