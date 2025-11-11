import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import { UserFavorite } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userId = 1;

  if (req.method === "GET") {
    try {
      const favorites = await query<UserFavorite[]>(
        "SELECT RecipeID FROM USER_FAVORITES WHERE UserID = ?",
        [userId]
      );
      const recipeIds = favorites.map((fav) => fav.RecipeID);
      res.status(200).json(recipeIds);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "POST") {
    try {
      const { recipeId } = req.body;

      if (!recipeId) {
        return res.status(400).json({ error: "Recipe ID is required" });
      }

      await query(
        "INSERT INTO USER_FAVORITES (UserID, RecipeID) VALUES (?, ?)",
        [userId, recipeId]
      );

      res.status(201).json({ message: "Recipe added to favorites" });
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        res.status(400).json({ error: "Recipe already in favorites" });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  } else if (req.method === "DELETE") {
    try {
      const { recipeId } = req.body;

      if (!recipeId) {
        return res.status(400).json({ error: "Recipe ID is required" });
      }

      await query(
        "DELETE FROM USER_FAVORITES WHERE UserID = ? AND RecipeID = ?",
        [userId, recipeId]
      );

      res.status(200).json({ message: "Recipe removed from favorites" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
