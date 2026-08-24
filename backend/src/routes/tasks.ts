import { Router } from "express";
import { prisma } from "../prismaClient";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { taskCreateSchema, taskUpdateSchema } from "../validators/schemas";
import { AppError } from "../middleware/errorHandler";
import { stripToPlainText } from "../utils/sanitize";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const tasks = await prisma.studyTask.findMany({
      where: { userId: req.userId },
      orderBy: [{ completed: "asc" }, { examDate: "asc" }],
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

router.post("/", validateBody(taskCreateSchema), async (req: AuthedRequest, res, next) => {
  try {
    const { subject, task, examDate, priority, estimatedHours } = req.body;
    const created = await prisma.studyTask.create({
      data: {
        userId: req.userId!,
        subject: stripToPlainText(subject),
        task: stripToPlainText(task),
        examDate: examDate ? new Date(examDate) : null,
        priority,
        estimatedHours: estimatedHours ?? null,
      },
    });
    res.status(201).json({ task: created });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", validateBody(taskUpdateSchema), async (req: AuthedRequest, res, next) => {
  try {
    const existing = await prisma.studyTask.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) throw new AppError("Task not found.", 404);

    const { subject, task, examDate, priority, estimatedHours, completed } = req.body;
    const updated = await prisma.studyTask.update({
      where: { id: existing.id },
      data: {
        ...(subject !== undefined && { subject: stripToPlainText(subject) }),
        ...(task !== undefined && { task: stripToPlainText(task) }),
        ...(examDate !== undefined && { examDate: examDate ? new Date(examDate) : null }),
        ...(priority !== undefined && { priority }),
        ...(estimatedHours !== undefined && { estimatedHours }),
        ...(completed !== undefined && { completed }),
      },
    });
    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const existing = await prisma.studyTask.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== req.userId) throw new AppError("Task not found.", 404);
    await prisma.studyTask.delete({ where: { id: existing.id } });
    res.json({ message: "Deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
