import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export type JwtPayload = {
  userId: string;
  role: string;
};

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function getUserFromRequest(req: NextRequest) {
  const token =
    req.cookies.get("auth_token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    return user;
  } catch {
    return null;
  }
}

export function requireRole(userRole: string | undefined, allowed: string[]) {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

