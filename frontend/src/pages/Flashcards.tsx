import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Plus, RotateCw, Trash2, XCircle } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import { api } from "../services/api";
import type { FlashcardDeck, Flashcard } from "../types";

function DeckList({ decks, onOpen, onCreate, onDelete }: { decks: FlashcardDeck[]; onOpen: (id: string) => void; onCreate: (subject: string, title: string) => Promise<void>; onDelete: (id: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !title.trim()) return;
    setSaving(true);
    try {
      await onCreate(subject, title);
      setSubject("");
      setTitle("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Flashcards</h1>
          <p className="mt-1 text-sm text-inkmute">Quick, spaced repetition review — cards you get right show up less often.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> New deck
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <Input label="Subject" required maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Cyber Security" />
            <Input label="Deck title" required maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter 4 — Network Security" />
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create deck"}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {decks.length === 0 && (
          <Card className="sm:col-span-2 text-center text-sm text-inkmute">No decks yet — create one for a subject you're revising.</Card>
        )}
        {decks.map((d) => (
          <Card key={d.id} className="flex items-start justify-between">
            <button onClick={() => onOpen(d.id)} className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-lavender-deep">{d.subject}</p>
              <h2 className="mt-1 font-display font-semibold text-ink">{d.title}</h2>
              <p className="mt-1 text-xs text-inkmute">{d.cardCount} card{d.cardCount === 1 ? "" : "s"}</p>
            </button>
            <button onClick={() => onDelete(d.id)} aria-label="Delete deck" className="text-inkmute hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DeckDetail({ deck, onBack }: { deck: FlashcardDeck; onBack: () => void }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [saving, setSaving] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get<{ cards: Flashcard[] }>(`/decks/${deck.id}/cards`);
    setCards(res.cards);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.id]);

  const addCard = async (e: FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setSaving(true);
    try {
      await api.post(`/decks/${deck.id}/cards`, { front, back });
      setFront("");
      setBack("");
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const deleteCard = async (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    await api.delete(`/decks/${deck.id}/cards/${id}`);
  };

  const startReview = () => {
    setReviewIndex(0);
    setFlipped(false);
    setReviewMode(true);
  };

  const answer = async (knewIt: boolean) => {
    const card = cards[reviewIndex];
    await api.post(`/decks/${deck.id}/cards/${card.id}/review`, { knewIt });
    setFlipped(false);
    if (reviewIndex + 1 < cards.length) {
      setReviewIndex((i) => i + 1);
    } else {
      setReviewMode(false);
      await load();
    }
  };

  if (reviewMode && cards.length > 0) {
    const card = cards[reviewIndex];
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">
          Card {reviewIndex + 1} of {cards.length}
        </p>
        <motion.button
          key={card.id}
          onClick={() => setFlipped((f) => !f)}
          className="mt-6 flex min-h-[220px] w-full items-center justify-center rounded-xl3 bg-white p-8 text-center shadow-calmLg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-display text-lg font-semibold text-ink">{flipped ? card.back : card.front}</p>
        </motion.button>
        <p className="mt-3 text-xs text-inkmute">{flipped ? "Answer" : "Tap the card to reveal the answer"}</p>

        {flipped && (
          <div className="mt-6 flex justify-center gap-4">
            <Button variant="secondary" onClick={() => answer(false)}>
              <XCircle size={16} /> Still learning
            </Button>
            <Button onClick={() => answer(true)}>
              <CheckCircle2 size={16} /> Got it
            </Button>
          </div>
        )}

        <button onClick={() => setReviewMode(false)} className="mt-8 text-xs font-semibold text-inkmute hover:text-ink">
          Exit review
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="text-sm font-semibold text-lavender-deep">
        ← All decks
      </button>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-lavender-deep">{deck.subject}</p>
          <h1 className="font-display text-2xl font-bold text-ink">{deck.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowForm((s) => !s)}>
            <Plus size={16} /> Add card
          </Button>
          {cards.length > 0 && (
            <Button size="sm" onClick={startReview}>
              <RotateCw size={16} /> Review
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card className="mt-6">
          <form onSubmit={addCard} className="grid gap-4">
            <Textarea label="Front (question)" required maxLength={500} rows={2} value={front} onChange={(e) => setFront(e.target.value)} />
            <Textarea label="Back (answer)" required maxLength={500} rows={2} value={back} onChange={(e) => setBack(e.target.value)} />
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Adding…" : "Add card"}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-inkmute">Loading cards…</p>}
        {!loading && cards.length === 0 && <Card className="text-center text-sm text-inkmute">No cards yet — add your first one above.</Card>}
        <AnimatePresence>
          {cards.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="flex items-start justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{c.front}</p>
                  <p className="mt-1 text-sm text-inkmute">{c.back}</p>
                  <p className="mt-1 text-[11px] text-inkmute">Box {c.box} of 5{c.box >= 4 ? " — well known" : ""}</p>
                </div>
                <button onClick={() => deleteCard(c.id)} aria-label="Delete card" className="text-inkmute hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Flashcards() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get<{ decks: FlashcardDeck[] }>("/decks");
    setDecks(res.decks);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createDeck = async (subject: string, title: string) => {
    await api.post("/decks", { subject, title });
    await load();
  };

  const deleteDeck = async (id: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== id));
    await api.delete(`/decks/${id}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {loading ? (
        <p className="text-sm text-inkmute">Loading your decks…</p>
      ) : activeDeck ? (
        <DeckDetail deck={activeDeck} onBack={() => { setActiveDeck(null); load(); }} />
      ) : (
        <DeckList
          decks={decks}
          onOpen={(id) => setActiveDeck(decks.find((d) => d.id === id) || null)}
          onCreate={createDeck}
          onDelete={deleteDeck}
        />
      )}
    </div>
  );
}
