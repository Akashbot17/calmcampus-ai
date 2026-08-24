import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

/**
 * Validates req.body against the given Zod schema. Rejects malformed
 * requests with 400 before any handler logic or DB access runs.
 * Never leaks internal error/stack info to the client.
 */
export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request",
        details: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }
    req.query = result.data as any;
    next();
  };
}
