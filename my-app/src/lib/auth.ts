import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { query } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export interface User {
  UserID: number;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Role: string;
}

export interface UserWithPassword extends User {
  PasswordHash: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.UserID,
      username: user.Username,
      email: user.Email,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUserById(userId: number): Promise<User | null> {
  const users = await query<UserWithPassword[]>(
    "SELECT UserID, Username, Email, FirstName, LastName, Role FROM USER WHERE UserID = ?",
    [userId]
  );
  return users.length > 0 ? users[0] : null;
}

export async function getUserByUsername(
  username: string
): Promise<UserWithPassword | null> {
  const users = await query<UserWithPassword[]>(
    "SELECT * FROM USER WHERE Username = ?",
    [username]
  );
  return users.length > 0 ? users[0] : null;
}

export async function createUser(
  username: string,
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const now = new Date();

  await query(
    `INSERT INTO USER (Username, Email, PasswordHash, FirstName, LastName, Role, CreatedAt)
     VALUES (?, ?, ?, ?, ?, 'user', ?)`,
    [username, email, passwordHash, firstName, lastName, now]
  );

  const user = await getUserByUsername(username);
  if (!user) {
    throw new Error("Failed to create user");
  }

  return {
    UserID: user.UserID,
    Username: user.Username,
    Email: user.Email,
    FirstName: user.FirstName,
    LastName: user.LastName,
    Role: user.Role,
  };
}
