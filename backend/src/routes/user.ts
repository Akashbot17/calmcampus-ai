import { Router } from "express";
import { prisma } from "../prismaClient";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { profileUpdateSchema } from "../validators/schemas";
import { AppError } from "../middleware/errorHandler";
import { stripToPlainText } from "../utils/sanitize";

const router = Router();
router.use(requireAuth);

router.get("/profile", async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw new AppError("User not found.", 404);
    const { passwordHash, ...safe } = user;
    res.json({ user: safe });
  } catch (err) {
    next(err);
  }
});

router.put("/profile", validateBody(profileUpdateSchema), async (req: AuthedRequest, res, next) => {
  try {
    const data: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === "string") data[key] = stripToPlainText(value);
    }
    const user = await prisma.user.update({ where: { id: req.userId }, data });
    const { passwordHash, ...safe } = user;
    res.json({ user: safe });
  } catch (err) {
    next(err);
  }
});

router.post("/onboard", async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.userId }, data: { onboarded: true } });
    const { passwordHash, ...safe } = user;
    res.json({ user: safe });
  } catch (err) {
    next(err);
  }
});

router.delete("/data", async (req: AuthedRequest, res, next) => {
  try {
    // "Delete My Data": cascade deletes conversations, moods, tasks via Prisma relations,
    // then removes the account itself.
    await prisma.user.delete({ where: { id: req.userId } });
    res.clearCookie("session", { path: "/" });
    res.json({ message: "Your data has been deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
