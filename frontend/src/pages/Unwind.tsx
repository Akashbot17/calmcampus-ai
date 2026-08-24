import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import BubblePop from "../components/games/BubblePop";
import MemoryMatch from "../components/games/MemoryMatch";

const PHASES = [
  { label: "Breathe in", seconds: 4 },
  { label: "Hold", seconds: 4 },
  { label: "Breathe out", seconds: 6 },
];

const TABS = [
  { key: "breathe", label: "Breathe" },
  { key: "bubbles", label: "Bubble Pop" },
  { key: "memory", label: "Memory Match" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Breathing() {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) return s - 1;
        setPhaseIndex((p) => (p + 1) % PHASES.length);
        return PHASES[(phaseIndex + 1) % PHASES.length].seconds;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, phaseIndex]);

  const start = () => {
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0].seconds);
    setRunning(true);
  };

  const phase = PHASES[phaseIndex];

  return (
    <div className="flex flex-col items-center text-center">
      <p className="max-w-sm text-sm text-inkmute">A short breathing exercise to help your body settle before you get back to it.</p>

      <div className="relative my-12 flex h-56 w-56 items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full bg-lavender-soft ${running ? "animate-breathe" : ""}`}
          style={{ animationDuration: running ? `${phase.seconds * 2}s` : undefined }}
          aria-hidden="true"
        />
        <div className="absolute inset-8 rounded-full bg-lavender/60" aria-hidden="true" />
        <Card glass className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full !p-0">
          <p className="font-display text-sm font-semibold text-ink">{running ? phase.label : "Ready?"}</p>
          {running && <p className="font-utility text-2xl font-bold text-lavender-deep">{secondsLeft}</p>}
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6 text-xs text-inkmute">
        <div><p className="font-semibold text-ink">Breathe in</p><p>4 seconds</p></div>
        <div><p className="font-semibold text-ink">Hold</p><p>4 seconds</p></div>
        <div><p className="font-semibold text-ink">Breathe out</p><p>6 seconds</p></div>
      </div>

      <Button size="lg" className="mt-8" onClick={running ? () => setRunning(false) : start}>
        {running ? "Stop" : "Start exercise"}
      </Button>
    </div>
  );
}

export default function Unwind() {
  const [tab, setTab] = useState<TabKey>("breathe");

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-center font-display text-2xl font-bold text-ink sm:text-3xl">Take a minute.</h1>
      <p className="mt-1 text-center text-sm text-inkmute">A calm space between study sessions — breathe, or let your mind rest with something simple.</p>

      <div className="mt-6 flex justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-ink text-canvas" : "bg-white text-inkmute border border-ink/10 hover:border-lavender-deep"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="mt-6 py-10">
        {tab === "breathe" && <Breathing />}
        {tab === "bubbles" && <BubblePop />}
        {tab === "memory" && <MemoryMatch />}
      </Card>

      <p className="mt-6 text-center text-xs text-inkmute">
        This is a grounding break, not a medical treatment. If you're in distress, please reach out to a trusted person or your college support services.
      </p>
    </div>
  );
}
