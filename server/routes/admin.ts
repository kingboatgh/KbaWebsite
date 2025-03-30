import { Router } from "express";
import { db } from "../db";
import { authenticateToken } from "./auth";

const router = Router();

// Get dashboard stats
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    // Get total posts
    const totalPostsResult = await db.query("SELECT COUNT(*) FROM blog_posts");
    const totalPosts = parseInt(totalPostsResult.rows[0].count);

    // Get published posts
    const publishedPostsResult = await db.query(
      "SELECT COUNT(*) FROM blog_posts WHERE status = 'published'"
    );
    const publishedPosts = parseInt(publishedPostsResult.rows[0].count);

    // Get draft posts
    const draftPostsResult = await db.query(
      "SELECT COUNT(*) FROM blog_posts WHERE status = 'draft'"
    );
    const draftPosts = parseInt(draftPostsResult.rows[0].count);

    // Get total users
    const totalUsersResult = await db.query("SELECT COUNT(*) FROM users");
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    res.json({
      success: true,
      data: {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard stats",
    });
  }
});

export default router; 