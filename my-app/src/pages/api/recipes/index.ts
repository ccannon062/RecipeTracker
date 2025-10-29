import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import { Recipe } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const results = await query<Recipe[]>(
        "SELECT * FROM RECIPE ORDER BY CreatedAT DESC"
      );
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "POST") {
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

      const TotalTime = PrepTime + CookTime;
      const CreatedBy = 1;

      const recipeResult = await query<any>(
        `INSERT INTO RECIPE 
         (RecipeName, RecipeDescription, PrepTime, CookTime, TotalTime, 
          Servings, Instructions, Photo_URL, CreatedBy, CreatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          RecipeName,
          RecipeDescription ?? null,
          PrepTime,
          CookTime,
          TotalTime,
          Servings,
          Instructions,
          Photo_URL ?? null,
          CreatedBy,
        ]
      );

      const newRecipeID = recipeResult.insertId;

      if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
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
              newRecipeID,
              ingredient.IngredientID,
              ingredient.Quantity,
              ingredient.Unit,
            ]
          );
        }
      }

      res.status(201).json({
        message: "Recipe created successfully",
        RecipeID: newRecipeID,
      });
    } catch (error) {
      console.error("POST /api/recipes error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
