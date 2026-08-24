import { Router } from "express";
import { prisma } from "../prismaClient";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { conversationCreateSchema, messageCreateSchema } from "../validators/schemas";
import { AppError } from "../middleware/errorHandler";
import { stripToPlainText } from "../utils/sanitize";
import { getAIReply } from "../services/aiService";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
});

router.post("/", validateBody(conversationCreateSchema), async (req: AuthedRequest, res, next) => {
  try {
    const title = req.body.title ? stripToPlainText(req.body.title) : "New conversation";
    const conversation = await prisma.conversation.create({
      data: { userId: req.userId!, title },
    });
    res.status(201).json({ conversation });
  } catch (err) {
    next(err);
  }
});

async function loadOwnedConversation(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  // IDOR prevention: a conversation must belong to the requesting user.
  if (!conversation || conversation.userId !== userId) return null;
  return conversation;
}

router.get("/:id/messages", async (req: AuthedRequest, res, next) => {
  try {
    const conversation = await loadOwnedConversation(req.userId!, req.params.id);
    if (!conversation) throw new AppError("Conversation not found.", 404);

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
    });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/messages", validateBody(messageCreateSchema), async (req: AuthedRequest, res, next) => {
  try {
    const conversation = await loadOwnedConversation(req.userId!, req.params.id);
    if (!conversation) throw new AppError("Conversation not found.", 404);

    // Never trust chat content: strip any HTML/script before storing.
    const safeContent = stripToPlainText(req.body.content);
    if (!safeContent) throw new AppError("Message cannot be empty.", 400);

    const userMessage = await prisma.message.create({
      data: { conversationId: conversation.id, role: "user", content: safeContent },
    });

    const history = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const aiText = await getAIReply(
      history.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
      safeContent
    );
    // AI output is also treated as untrusted before it's stored/rendered.
    const safeAiText = stripToPlainText(aiText);

    const assistantMessage = await prisma.message.create({
      data: { conversationId: conversation.id, role: "assistant", content: safeAiText },
    });

    await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

    res.status(201).json({ userMessage, assistantMessage });
  } catch (err) {
    next(err);
  }
});

export default router;
