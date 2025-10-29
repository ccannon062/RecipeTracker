import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import { Ingredient } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const results = await query<Ingredient[]>(
        "SELECT * FROM INGREDIENT ORDER BY IngredientName ASC",
        []
      );
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
