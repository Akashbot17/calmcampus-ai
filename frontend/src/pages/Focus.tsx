import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressRing from "../components/ui/ProgressRing";
import { api } from "../services/api";
import type { StudyTask } from "../types";

const MODES = {
  focus: { label: "Focus", minutes: 25, color: "#8B7EDB" },
  short: { label: "Short break", minutes: 5, color: "#5FB88A" },
  long: { label: "Long break", minutes: 15, color: "#5FA6D8" },
} as const;

type ModeKey = keyof typeof MODES;

const SESSIONS_KEY = "calmcampus_focus_sessions";

function todaySessionCount(): number {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as { date: string; count: number };
    const today = new Date().toDateString();
    return data.date === today ? data.count : 0;
  } catch {
    return 0;
  }
}

function bumpSessionCount() {
  const today = new Date().toDateString();
  const count = todaySessionCount() + 1;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify({ date: today, count }));
  return count;
}

export default function Focus() {
  const [mode, setMode] = useState<ModeKey>("focus");
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [sessionsToday, setSessionsToday] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSessionsToday(todaySessionCount());
    api
      .get<{ tasks: StudyTask[] }>("/tasks")
      .then((res) => setTasks(res.tasks.filter((t) => !t.completed)))
      .catch(() => setTasks([]));
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === "focus") setSessionsToday(bumpSessionCount());
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const switchMode = (m: ModeKey) => {
    setRunning(false);
    setMode(m);
    setSecondsLeft(MODES[m].minutes * 60);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(MODES[mode].minutes * 60);
  };

  const totalSeconds = MODES[mode].minutes * 60;
  const progressValue = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Focus Timer</h1>
      <p className="mt-1 text-sm text-inkmute">Short, timed sessions tend to beat marathon studying — this uses the Pomodoro method.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(MODES) as ModeKey[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              mode === m ? "bg-ink text-canvas" : "bg-white text-inkmute border border-ink/10 hover:border-lavender-deep"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      <Card className="mt-6 flex flex-col items-center py-12">
        <ProgressRing value={progressValue} size={220} strokeWidth={14} color={MODES[mode].color} />
        <p className="-mt-[130px] font-utility text-5xl font-bold text-ink">{mm}:{ss}</p>

        <div className="mt-24 flex items-center gap-3">
          <Button size="lg" onClick={() => setRunning((r) => !r)} disabled={secondsLeft === 0}>
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? "Pause" : secondsLeft === totalSeconds ? "Start" : "Resume"}
          </Button>
          <Button size="lg" variant="secondary" onClick={reset} aria-label="Reset timer">
            <RotateCcw size={18} />
          </Button>
        </div>

        {mode === "focus" && tasks.length > 0 && (
          <div className="mt-8 w-full max-w-sm">
            <label className="text-xs font-semibold uppercase tracking-wide text-inkmute">Focusing on</label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-lavender-deep"
            >
              <option value="">General study session</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.subject} — {t.task}
                </option>
              ))}
            </select>
            {selectedTask && <p className="mt-2 text-xs text-inkmute">Nice — one small step on {selectedTask.subject} counts.</p>}
          </div>
        )}
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Card className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Focus sessions today</p>
          <p className="mt-2 font-utility text-3xl font-bold text-ink">{sessionsToday}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Focused minutes today</p>
          <p className="mt-2 font-utility text-3xl font-bold text-ink">{sessionsToday * MODES.focus.minutes}</p>
        </Card>
      </div>
    </div>
  );
}
