import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import { Recipe, IngredientWithDetails, RecipeWithDetails } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const RecipeID = req.query.id;

  if (req.method === "GET") {
    try {
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

      const recipeWithDetails: RecipeWithDetails = {
        ...recipe,
        ingredients: ingredients,
        categories: [],
      };
      res.status(200).json(recipeWithDetails);
    } catch (error) {
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

      res.status(200).json({
        message: "Recipe updated successfully",
        RecipeID: RecipeID,
      });
    } catch (error) {
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
