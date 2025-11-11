import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import { Category } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const categories = await query<Category[]>(
        "SELECT * FROM RECIPE_CATEGORY ORDER BY CategoryName ASC",
        []
      );
      res.status(200).json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
