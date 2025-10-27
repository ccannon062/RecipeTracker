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
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
