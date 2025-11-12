import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";

interface Rating {
  RatingID: number;
  RecipeID: number;
  UserID: number;
  Rating: number;
  Notes: string | null;
  CreatedAt: Date;
  Username: string;
  FirstName: string;
  LastName: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { recipeId } = req.query;

  if (!recipeId || Array.isArray(recipeId)) {
    return res.status(400).json({ error: "Invalid recipe ID" });
  }

  if (req.method === "GET") {
    try {
      const ratings = await query<Rating[]>(
        `SELECT rr.*, u.Username, u.FirstName, u.LastName
         FROM RECIPE_RATING rr
         JOIN USER u ON rr.UserID = u.UserID
         WHERE rr.RecipeID = ?
         ORDER BY rr.CreatedAt DESC`,
        [recipeId]
      );

      const avgResult = await query<{ avgRating: number; count: number }[]>(
        `SELECT AVG(Rating) as avgRating, COUNT(*) as count
         FROM RECIPE_RATING
         WHERE RecipeID = ?`,
        [recipeId]
      );

      return res.status(200).json({
        ratings,
        average: avgResult[0]?.avgRating || 0,
        count: avgResult[0]?.count || 0,
      });
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return res.status(500).json({ error: "Failed to fetch ratings" });
    }
  }

  if (req.method === "POST") {
    try {
      const cookies = parse(req.headers.cookie || "");
      const token = cookies.token;

      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const { rating, notes } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5" });
      }

      const existingRating = await query<Rating[]>(
        "SELECT * FROM RECIPE_RATING WHERE UserID = ? AND RecipeID = ?",
        [decoded.userId, recipeId]
      );

      if (existingRating.length > 0) {
        await query(
          "UPDATE RECIPE_RATING SET Rating = ?, Notes = ? WHERE UserID = ? AND RecipeID = ?",
          [rating, notes || null, decoded.userId, recipeId]
        );
      } else {
        await query(
          "INSERT INTO RECIPE_RATING (RecipeID, UserID, Rating, Notes, CreatedAt) VALUES (?, ?, ?, ?, ?)",
          [recipeId, decoded.userId, rating, notes || null, new Date()]
        );
      }

      return res.status(200).json({ message: "Rating submitted successfully" });
    } catch (error) {
      console.error("Error submitting rating:", error);
      return res.status(500).json({ error: "Failed to submit rating" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const cookies = parse(req.headers.cookie || "");
      const token = cookies.token;

      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: "Invalid token" });
      }

      await query(
        "DELETE FROM RECIPE_RATING WHERE UserID = ? AND RecipeID = ?",
        [decoded.userId, recipeId]
      );

      return res.status(200).json({ message: "Rating deleted successfully" });
    } catch (error) {
      console.error("Error deleting rating:", error);
      return res.status(500).json({ error: "Failed to delete rating" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
