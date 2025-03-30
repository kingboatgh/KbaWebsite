import { db } from "../db";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, "0000_initial.sql");
    const migration = fs.readFileSync(migrationPath, "utf-8");

    // Run the migration
    await db.query(migration);
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

runMigrations(); 