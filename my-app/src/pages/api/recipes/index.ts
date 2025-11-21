import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import { Recipe } from "@/types";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { search, maxPrepTime, maxServings, sortBy } = req.query;

      let sql = "SELECT DISTINCT r.* FROM RECIPE r";
      const params: any[] = [];
      const conditions: string[] = [];

      if (search) {
        sql += ` LEFT JOIN RECIPE_INGREDIENTS ri ON r.RecipeID = ri.RecipeID
                 LEFT JOIN INGREDIENT i ON ri.IngredientID = i.IngredientID`;
        conditions.push(
          "(r.RecipeName LIKE ? OR r.RecipeDescription LIKE ? OR i.IngredientName LIKE ?)"
        );
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (maxPrepTime) {
        conditions.push("r.TotalTime <= ?");
        params.push(parseInt(maxPrepTime as string));
      }

      if (maxServings) {
        conditions.push("r.Servings <= ?");
        params.push(parseInt(maxServings as string));
      }

      if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
      }

      let orderBy = "r.CreatedAt DESC";
      switch (sortBy) {
        case "oldest":
          orderBy = "r.CreatedAt ASC";
          break;
        case "time-asc":
          orderBy = "r.TotalTime ASC";
          break;
        case "time-desc":
          orderBy = "r.TotalTime DESC";
          break;
        case "servings-asc":
          orderBy = "r.Servings ASC";
          break;
        case "servings-desc":
          orderBy = "r.Servings DESC";
          break;
        case "name-asc":
          orderBy = "r.RecipeName ASC";
          break;
        case "name-desc":
          orderBy = "r.RecipeName DESC";
          break;
        case "newest":
        default:
          orderBy = "r.CreatedAt DESC";
      }
      sql += ` ORDER BY ${orderBy}`;

      const results = await query<Recipe[]>(sql, params);

      for (const recipe of results) {
        const categoryResults = await query<{ CategoryName: string }[]>(
          `SELECT rc.CategoryName
          FROM RECIPE_CATEGORIES rcs
          JOIN RECIPE_CATEGORY rc ON rcs.CategoryID = rc.CategoryID
          WHERE rcs.RecipeID = ?`,
          [recipe.RecipeID]
        );
        (recipe as any).categories = categoryResults.map((c) => c.CategoryName);

        const ratingResults = await query<
          { avgRating: number; count: number }[]
        >(
          `SELECT AVG(Rating) as avgRating, COUNT(*) as count
           FROM RECIPE_RATING
           WHERE RecipeID = ?`,
          [recipe.RecipeID]
        );
        (recipe as any).averageRating = ratingResults[0]?.avgRating || 0;
        (recipe as any).ratingCount = ratingResults[0]?.count || 0;
      }

      res.status(200).json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "POST") {
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

      const TotalTime = PrepTime + CookTime;
      const CreatedBy = decoded.userId;

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

      if (categories && Array.isArray(categories) && categories.length > 0) {
        for (const categoryId of categories) {
          await query(
            "INSERT INTO RECIPE_CATEGORIES (RecipeID, CategoryID) VALUES (?, ?)",
            [newRecipeID, categoryId]
          );
        }
      }

      res.status(201).json({
        message: "Recipe created successfully",
        RecipeID: newRecipeID,
      });
    } catch (error: any) {
      console.error("POST /api/recipes error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
