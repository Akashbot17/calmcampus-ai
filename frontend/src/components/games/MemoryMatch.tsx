import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Droplet, Flower2, Leaf, Moon, Snowflake, Star, Sun } from "lucide-react";
import Button from "../ui/Button";

const ICONS = [Cloud, Droplet, Flower2, Leaf, Moon, Snowflake, Star, Sun];

interface CardItem {
  id: number;
  iconIndex: number;
}

function buildDeck(): CardItem[] {
  const pairs = ICONS.map((_, i) => i).flatMap((i) => [i, i]);
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((iconIndex, id) => ({ id, iconIndex }));
}

export default function MemoryMatch() {
  const [deck, setDeck] = useState<CardItem[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      setMoves((m) => m + 1);
      if (deck[a].iconIndex === deck[b].iconIndex) {
        setMatched((prev) => new Set(prev).add(deck[a].iconIndex));
        setFlipped([]);
      } else {
        const t = setTimeout(() => setFlipped([]), 700);
        return () => clearTimeout(t);
      }
    }
  }, [flipped, deck]);

  const onFlip = (id: number) => {
    if (flipped.length === 2) return;
    if (flipped.includes(id)) return;
    if (matched.has(deck[id].iconIndex)) return;
    setFlipped((f) => [...f, id]);
  };

  const reset = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
  };

  const complete = matched.size === ICONS.length;
  const isVisible = (c: CardItem) => flipped.includes(c.id) || matched.has(c.iconIndex);

  const grid = useMemo(() => deck, [deck]);

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-inkmute">A gentle memory game — nothing timed, nothing scored against you.</p>
      <p className="mt-1 text-xs text-inkmute">Moves: {moves}</p>

      <div className="mt-6 grid grid-cols-4 gap-3">
        {grid.map((c) => {
          const Icon = ICONS[c.iconIndex];
          const visible = isVisible(c);
          return (
            <motion.button
              key={c.id}
              onClick={() => onFlip(c.id)}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-calm sm:h-20 sm:w-20 ${
                visible ? "bg-lavender-soft text-lavender-deep" : "bg-white text-transparent"
              }`}
              whileTap={{ scale: 0.92 }}
              aria-label={visible ? "Card" : "Hidden card"}
            >
              <Icon size={26} />
            </motion.button>
          );
        })}
      </div>

      {complete && (
        <div className="mt-8 text-center">
          <p className="font-display font-semibold text-ink">All matched in {moves} moves 🎉</p>
          <Button className="mt-4" onClick={reset}>
            Play again
          </Button>
        </div>
      )}
    </div>
  );
}
