import { Router, Request } from "express";
import jwt from "jsonwebtoken";
import { LoginSchema, CreateUserSchema, hashPassword, comparePasswords } from "../models/User";
import { db } from "../db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Middleware to verify JWT token
export const authenticateToken = (req: AuthRequest, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Login route
router.post("/login", async (req, res) => {
  try {
    const loginData = LoginSchema.parse(req.body);
    const user = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [loginData.email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const isValidPassword = await comparePasswords(
      loginData.password,
      user.rows[0].password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.rows[0].id,
          email: user.rows[0].email,
          name: user.rows[0].name,
          role: user.rows[0].role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({
      success: false,
      error: "Invalid request data",
    });
  }
});

// Create user route (admin only)
router.post("/users", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Only admins can create users",
      });
    }

    const userData = CreateUserSchema.parse(req.body);
    const hashedPassword = await hashPassword(userData.password);

    const result = await db.query(
      `INSERT INTO users (email, password, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at, updated_at`,
      [userData.email, hashedPassword, userData.name, userData.role]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(400).json({
      success: false,
      error: "Invalid request data",
    });
  }
});

// Get current user
router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await db.query(
      "SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1",
      [req.user?.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user.rows[0],
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router; 