import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  userId?: string;
}

const SESSION_SECRET = process.env.SESSION_SECRET || "dev_only_insecure_secret_change_me";

export function signSession(userId: string): string {
  return jwt.sign({ sub: userId }, SESSION_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d",
  });
}

/** Requires a valid session cookie; attaches req.userId; returns 401 otherwise. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.session;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const payload = jwt.verify(token, SESSION_SECRET) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Session expired or invalid" });
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};
