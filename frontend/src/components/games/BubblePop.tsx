import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import Button from "../ui/Button";

const COLORS = ["#C6BCEF", "#AEE4C6", "#A9CBEF", "#F3C7A2"];
const GRID_SIZE = 30;

function makeBubbles(seedOffset = 0) {
  return Array.from({ length: GRID_SIZE }, (_, i) => ({
    id: `${Date.now()}-${seedOffset}-${i}`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 34 + Math.round(Math.random() * 22),
  }));
}

export default function BubblePop() {
  const [bubbles, setBubbles] = useState(() => makeBubbles());
  const [popped, setPopped] = useState<Set<string>>(new Set());
  const remaining = bubbles.length - popped.size;

  const pop = (id: string) => {
    setPopped((prev) => new Set(prev).add(id));
  };

  const reset = () => {
    setBubbles(makeBubbles(Math.random()));
    setPopped(new Set());
  };

  const allPopped = remaining === 0;
  const layout = useMemo(() => bubbles, [bubbles]);

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-inkmute">Pop every bubble. No score, no pressure — just something satisfying to do with your hands for a minute.</p>

      <div className="mt-6 grid grid-cols-6 place-items-center gap-3 sm:grid-cols-6">
        <AnimatePresence>
          {layout.map((b) =>
            popped.has(b.id) ? null : (
              <motion.button
                key={b.id}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 0.7 }}
                transition={{ duration: 0.25 }}
                onClick={() => pop(b.id)}
                aria-label="Pop bubble"
                style={{ width: b.size, height: b.size, backgroundColor: b.color }}
                className="rounded-full shadow-calm"
              />
            )
          )}
        </AnimatePresence>
      </div>

      {allPopped ? (
        <div className="mt-8 text-center">
          <p className="font-display font-semibold text-ink">All popped. Nicely done.</p>
          <Button className="mt-4" onClick={reset}>
            <RotateCcw size={16} /> Pop another set
          </Button>
        </div>
      ) : (
        <p className="mt-6 text-xs text-inkmute">{remaining} left</p>
      )}
    </div>
  );
}
