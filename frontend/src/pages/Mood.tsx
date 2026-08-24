import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Textarea from "../components/ui/Textarea";
import ProgressRing from "../components/ui/ProgressRing";
import { api } from "../services/api";
import type { MoodEntry, MoodValue } from "../types";

const moodOptions: { value: MoodValue; label: string; emoji: string }[] = [
  { value: "calm", label: "Calm", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "🙂‍↕️" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "stressed", label: "Stressed", emoji: "😣" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "😞" },
];

const moodScore: Record<MoodValue, number> = { calm: 90, okay: 72, neutral: 55, stressed: 35, overwhelmed: 18 };

export default function Mood() {
  const [selected, setSelected] = useState<MoodValue | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await api.get<{ moods: MoodEntry[] }>("/moods");
    setEntries(res.moods);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveCheckIn = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.post("/moods", { mood: selected, note });
      setSelected(null);
      setNote("");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const weekEntries = entries.slice(0, 7).reverse();
  const avgStress = weekEntries.length ? Math.round(100 - weekEntries.reduce((s, e) => s + moodScore[e.mood as MoodValue], 0) / weekEntries.length) : 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">How are you feeling today?</h1>

      <Card className="mt-6">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {moodOptions.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelected(m.value)}
              className={`flex flex-col items-center gap-2 rounded-2xl border py-4 text-xs font-semibold transition-colors ${
                selected === m.value ? "border-lavender-deep bg-lavender-soft text-lavender-deep" : "border-ink/10 bg-white text-inkmute hover:border-lavender-deep"
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-6">
            <Textarea
              label="What's contributing to how you feel?"
              placeholder="I have an exam tomorrow and haven't finished revision."
              rows={3}
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button className="mt-4" onClick={saveCheckIn} disabled={saving}>
              {saving ? "Saving your check-in…" : "Save Check-in"}
            </Button>
          </div>
        )}
      </Card>

      <h2 className="mt-12 font-display text-xl font-bold text-ink">Weekly overview</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Stress level</p>
          <div className="mt-3"><ProgressRing value={avgStress} size={100} strokeWidth={9} color="#F3A26B" /></div>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Check-ins this week</p>
          <p className="mt-3 font-utility text-3xl font-bold text-ink">{weekEntries.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Mood trend</p>
          <div className="mt-4 flex items-end gap-1.5" role="img" aria-label="Mood trend over recent check-ins">
            {loading && <p className="text-xs text-inkmute">Loading…</p>}
            {!loading && weekEntries.length === 0 && <p className="text-xs text-inkmute">No check-ins yet.</p>}
            {weekEntries.map((e) => (
              <div
                key={e.id}
                title={e.mood}
                className="w-4 rounded-full bg-lavender-deep"
                style={{ height: `${Math.max(8, moodScore[e.mood as MoodValue] * 0.6)}px` }}
              />
            ))}
          </div>
        </Card>
      </div>

      {entries.length > 0 && (
        <div className="mt-8 space-y-3">
          {entries.slice(0, 6).map((e) => (
            <Card key={e.id} className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-semibold capitalize text-ink">{e.mood}</p>
                {e.note && <p className="mt-0.5 max-w-md text-sm text-inkmute">{e.note}</p>}
              </div>
              <p className="text-xs text-inkmute">{new Date(e.createdAt).toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
