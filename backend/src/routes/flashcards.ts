import { Router } from "express";
import { prisma } from "../prismaClient";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { deckCreateSchema, cardCreateSchema, cardReviewSchema } from "../validators/schemas";
import { AppError } from "../middleware/errorHandler";
import { stripToPlainText } from "../utils/sanitize";

const router = Router();
router.use(requireAuth);

async function loadOwnedDeck(userId: string, deckId: string) {
  const deck = await prisma.flashcardDeck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== userId) return null;
  return deck;
}

router.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const decks = await prisma.flashcardDeck.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { cards: true } } },
    });
    res.json({
      decks: decks.map((d: (typeof decks)[number]) => ({
        id: d.id,
        subject: d.subject,
        title: d.title,
        cardCount: d._count.cards,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", validateBody(deckCreateSchema), async (req: AuthedRequest, res, next) => {
  try {
    const deck = await prisma.flashcardDeck.create({
      data: {
        userId: req.userId!,
        subject: stripToPlainText(req.body.subject),
        title: stripToPlainText(req.body.title),
      },
    });
    res.status(201).json({ deck });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const deck = await loadOwnedDeck(req.userId!, req.params.id);
    if (!deck) throw new AppError("Deck not found.", 404);
    await prisma.flashcardDeck.delete({ where: { id: deck.id } });
    res.json({ message: "Deleted." });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/cards", async (req: AuthedRequest, res, next) => {
  try {
    const deck = await loadOwnedDeck(req.userId!, req.params.id);
    if (!deck) throw new AppError("Deck not found.", 404);
    const cards = await prisma.flashcard.findMany({
      where: { deckId: deck.id },
      orderBy: [{ box: "asc" }, { createdAt: "asc" }],
    });
    res.json({ cards });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/cards", validateBody(cardCreateSchema), async (req: AuthedRequest, res, next) => {
  try {
    const deck = await loadOwnedDeck(req.userId!, req.params.id);
    if (!deck) throw new AppError("Deck not found.", 404);

    const card = await prisma.flashcard.create({
      data: {
        deckId: deck.id,
        front: stripToPlainText(req.body.front),
        back: stripToPlainText(req.body.back),
      },
    });
    await prisma.flashcardDeck.update({ where: { id: deck.id }, data: { updatedAt: new Date() } });
    res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
});

router.delete("/:deckId/cards/:cardId", async (req: AuthedRequest, res, next) => {
  try {
    const deck = await loadOwnedDeck(req.userId!, req.params.deckId);
    if (!deck) throw new AppError("Deck not found.", 404);
    const card = await prisma.flashcard.findUnique({ where: { id: req.params.cardId } });
    if (!card || card.deckId !== deck.id) throw new AppError("Card not found.", 404);
    await prisma.flashcard.delete({ where: { id: card.id } });
    res.json({ message: "Deleted." });
  } catch (err) {
    next(err);
  }
});

// Simple Leitner system: knowing a card moves it up a box (reviewed less
// often); missing it drops it back to box 1 (reviewed again soon).
router.post("/:deckId/cards/:cardId/review", validateBody(cardReviewSchema), async (req: AuthedRequest, res, next) => {
  try {
    const deck = await loadOwnedDeck(req.userId!, req.params.deckId);
    if (!deck) throw new AppError("Deck not found.", 404);
    const card = await prisma.flashcard.findUnique({ where: { id: req.params.cardId } });
    if (!card || card.deckId !== deck.id) throw new AppError("Card not found.", 404);

    const nextBox = req.body.knewIt ? Math.min(card.box + 1, 5) : 1;
    const updated = await prisma.flashcard.update({
      where: { id: card.id },
      data: { box: nextBox, lastReviewed: new Date() },
    });
    res.json({ card: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
