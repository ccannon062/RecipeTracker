import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";
import { User } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const results = await query<User[]>(
      "SELECT UserID, Username, Email FROM USER",
      []
    );
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
