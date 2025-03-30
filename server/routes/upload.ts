import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { authenticateToken } from "./auth";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
    }
  },
});

// Upload file
router.post("/", authenticateToken, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        url: fileUrl,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload file",
    });
  }
});

export default router; 