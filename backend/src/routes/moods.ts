import { Router } from "express";
import { prisma } from "../prismaClient";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { moodCreateSchema } from "../validators/schemas";
import { AppError } from "../middleware/errorHandler";
import { stripToPlainText } from "../utils/sanitize";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const moods = await prisma.moodEntry.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    res.json({ moods });
  } catch (err) {
    next(err);
  }
});

router.post("/", validateBody(moodCreateSchema), async (req: AuthedRequest, res, next) => {
  try {
    const mood = await prisma.moodEntry.create({
      data: {
        userId: req.userId!,
        mood: req.body.mood,
        note: stripToPlainText(req.body.note || ""),
      },
    });
    res.status(201).json({ mood });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const entry = await prisma.moodEntry.findUnique({ where: { id: req.params.id } });
    if (!entry || entry.userId !== req.userId) throw new AppError("Mood entry not found.", 404);
    await prisma.moodEntry.delete({ where: { id: entry.id } });
    res.json({ message: "Deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
