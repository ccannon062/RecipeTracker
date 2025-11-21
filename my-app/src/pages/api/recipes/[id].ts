import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import { Recipe, IngredientWithDetails, RecipeWithDetails } from "@/types";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const RecipeID = req.query.id;

  if (req.method === "GET") {
    try {
      const cookies = parse(req.headers.cookie || "");
      const token = cookies.token;
      let userId = null;

      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          userId = decoded.userId;
        }
      }

      const recipeResult = await query<Recipe[]>(
        "SELECT * FROM RECIPE WHERE RecipeID = ?",
        [RecipeID]
      );
      if (recipeResult.length === 0) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      const recipe = recipeResult[0];
      const ingredients = await query<IngredientWithDetails[]>(
        `SELECT
          i.IngredientID,
          i.IngredientName,
          ri.Quantity,
          ri.Unit
        FROM RECIPE_INGREDIENTS ri
        JOIN INGREDIENT i ON ri.IngredientID = i.IngredientID
        WHERE ri.RecipeID = ?`,
        [RecipeID]
      );

      const categoryResults = await query<{ CategoryName: string }[]>(
        `SELECT rc.CategoryName
        FROM RECIPE_CATEGORIES rcs
        JOIN RECIPE_CATEGORY rc ON rcs.CategoryID = rc.CategoryID
        WHERE rcs.RecipeID = ?`,
        [RecipeID]
      );
      const categories = categoryResults.map((c) => c.CategoryName);

      let isFavorite = false;
      if (userId) {
        const favoriteResult = await query<any[]>(
          "SELECT 1 FROM USER_FAVORITES WHERE UserID = ? AND RecipeID = ?",
          [userId, RecipeID]
        );
        isFavorite = favoriteResult.length > 0;
      }

      const recipeWithDetails: RecipeWithDetails = {
        ...recipe,
        ingredients: ingredients,
        categories: categories,
        isFavorite: isFavorite,
      };
      res.status(200).json(recipeWithDetails);
    } catch (error: any) {
      console.error("GET /api/recipes/[id] error:", error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "PUT") {
    try {
      const {
        RecipeName,
        RecipeDescription,
        PrepTime,
        CookTime,
        Servings,
        Instructions,
        Photo_URL,
        ingredients,
        categories,
      } = req.body;

      if (
        !RecipeName ||
        PrepTime === undefined ||
        CookTime === undefined ||
        Servings === undefined ||
        !Instructions
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const recipeResult = await query<Recipe[]>(
        "SELECT RecipeID FROM RECIPE WHERE RecipeID = ?",
        [RecipeID]
      );

      if (recipeResult.length === 0) {
        return res.status(404).json({ error: "Recipe not found" });
      }

      const TotalTime = PrepTime + CookTime;

      await query(
        `UPDATE RECIPE
         SET RecipeName = ?, RecipeDescription = ?, PrepTime = ?, CookTime = ?,
             TotalTime = ?, Servings = ?, Instructions = ?, Photo_URL = ?,
             UpdatedAt = NOW()
         WHERE RecipeID = ?`,
        [
          RecipeName,
          RecipeDescription ?? null,
          PrepTime,
          CookTime,
          TotalTime,
          Servings,
          Instructions,
          Photo_URL ?? null,
          RecipeID,
        ]
      );

      if (ingredients && Array.isArray(ingredients)) {
        await query("DELETE FROM RECIPE_INGREDIENTS WHERE RecipeID = ?", [
          RecipeID,
        ]);

        if (ingredients.length > 0) {
          for (const ingredient of ingredients) {
            if (
              !ingredient.IngredientID ||
              ingredient.Quantity === undefined ||
              !ingredient.Unit
            ) {
              console.error("Invalid ingredient:", ingredient);
              continue;
            }

            await query(
              `INSERT INTO RECIPE_INGREDIENTS
               (RecipeID, IngredientID, Quantity, Unit)
               VALUES (?, ?, ?, ?)`,
              [
                RecipeID,
                ingredient.IngredientID,
                ingredient.Quantity,
                ingredient.Unit,
              ]
            );
          }
        }
      }

      if (categories && Array.isArray(categories)) {
        await query("DELETE FROM RECIPE_CATEGORIES WHERE RecipeID = ?", [
          RecipeID,
        ]);

        if (categories.length > 0) {
          for (const categoryId of categories) {
            await query(
              "INSERT INTO RECIPE_CATEGORIES (RecipeID, CategoryID) VALUES (?, ?)",
              [RecipeID, categoryId]
            );
          }
        }
      }

      res.status(200).json({
        message: "Recipe updated successfully",
        RecipeID: RecipeID,
      });
    } catch (error: any) {
      console.error("PUT /api/recipes/[id] error:", error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const recipeResult = await query<Recipe[]>(
        "SELECT RecipeID FROM RECIPE WHERE RecipeID = ?",
        [RecipeID]
      );

      if (recipeResult.length === 0) {
        return res.status(404).json({ error: "Recipe not found" });
      }

      await query("DELETE FROM RECIPE WHERE RecipeID = ?", [RecipeID]);

      res.status(200).json({
        message: "Recipe deleted successfully",
        RecipeID: RecipeID,
      });
    } catch (error) {
      console.error("DELETE /api/recipes/[id] error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
