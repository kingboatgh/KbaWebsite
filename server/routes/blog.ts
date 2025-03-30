import { Router, Request } from "express";
import { db } from "../db";
import { authenticateToken } from "./auth";

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const router = Router();

// Get all blog posts
router.get("/posts", async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = "SELECT * FROM blog_posts";
    const params: any[] = [];

    if (status) {
      query += " WHERE status = $1";
      params.push(status);
    }

    query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3";
    params.push(Number(limit), offset);

    const posts = await db.query(query, params);
    const total = await db.query("SELECT COUNT(*) FROM blog_posts");

    res.json({
      success: true,
      data: {
        posts: posts.rows,
        total: parseInt(total.rows[0].count),
      },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch blog posts",
    });
  }
});

// Get a single blog post
router.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await db.query(
      "SELECT * FROM blog_posts WHERE id = $1",
      [id]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    res.json({
      success: true,
      data: post.rows[0],
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch blog post",
    });
  }
});

// Create a new blog post
router.post("/posts", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      status,
      publishedAt,
      featuredImage,
      categories,
      tags,
    } = req.body;

    const result = await db.query(
      `INSERT INTO blog_posts (
        title, slug, content, excerpt, status, published_at,
        featured_image, categories, tags, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        title,
        slug,
        content,
        excerpt,
        status,
        publishedAt,
        featuredImage,
        categories,
        tags,
        req.user.id,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create blog post",
    });
  }
});

// Update a blog post
router.put("/posts/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      status,
      publishedAt,
      featuredImage,
      categories,
      tags,
    } = req.body;

    const result = await db.query(
      `UPDATE blog_posts
       SET title = $1, slug = $2, content = $3, excerpt = $4,
           status = $5, published_at = $6, featured_image = $7,
           categories = $8, tags = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        title,
        slug,
        content,
        excerpt,
        status,
        publishedAt,
        featuredImage,
        categories,
        tags,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update blog post",
    });
  }
});

// Delete a blog post
router.delete("/posts/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM blog_posts WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete blog post",
    });
  }
});

export default router; 