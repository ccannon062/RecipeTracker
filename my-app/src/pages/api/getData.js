import mysql from "mysql2/promise";

export default async function handler(req, res) {
  const dbconnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
  try {
    const query = "SELECT UserID, Username, Email FROM USER";
    const values = [];
    const [results] = await dbconnection.execute(query, values);
    dbconnection.end();
    res.status(200).json({ results: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
