import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Flame, Sparkles, Timer, Wind } from "lucide-react";
import Card from "../components/ui/Card";
import ProgressRing from "../components/ui/ProgressRing";
import Skeleton from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { MoodEntry, StudyTask } from "../types";

function computeStreak(moods: MoodEntry[]): number {
  if (moods.length === 0) return 0;
  const days = new Set(moods.map((m) => new Date(m.createdAt).toDateString()));
  let streak = 0;
  const cursor = new Date();
  // A check-in today is optional for the streak to still count from yesterday.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function Today() {
  const { user } = useAuth();
  const [moods, setMoods] = useState<MoodEntry[] | null>(null);
  const [tasks, setTasks] = useState<StudyTask[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [m, t] = await Promise.all([api.get<{ moods: MoodEntry[] }>("/moods"), api.get<{ tasks: StudyTask[] }>("/tasks")]);
        setMoods(m.moods);
        setTasks(t.tasks);
      } catch {
        setMoods([]);
        setTasks([]);
      }
    })();
  }, []);

  const loading = moods === null || tasks === null;
  const latestMood = moods?.[0];
  const calmScore = latestMood?.mood === "calm" ? 82 : latestMood?.mood === "okay" ? 68 : latestMood?.mood === "neutral" ? 55 : latestMood?.mood === "stressed" ? 38 : latestMood?.mood === "overwhelmed" ? 24 : 60;

  const completed = tasks?.filter((t) => t.completed).length ?? 0;
  const total = tasks?.length ?? 0;
  const upcoming = tasks
    ?.filter((t) => t.examDate && !t.completed)
    .sort((a, b) => new Date(a.examDate!).getTime() - new Date(b.examDate!).getTime())[0];

  const daysUntil = upcoming?.examDate
    ? Math.max(0, Math.ceil((new Date(upcoming.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const streak = moods ? computeStreak(moods) : 0;
  const calmPoints = (moods?.length ?? 0) * 10 + completed * 5;

  const priorityWeight = { High: 3, Medium: 2, Low: 1 } as const;
  const todaysFocus = tasks
    ?.filter((t) => !t.completed)
    .sort((a, b) => {
      const w = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (w !== 0) return w;
      if (a.examDate && b.examDate) return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
      if (a.examDate) return -1;
      if (b.examDate) return 1;
      return 0;
    })[0];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Good to see you, {user?.name?.split(" ")[0] || "there"} 👋</h1>
      <p className="mt-1 text-sm text-inkmute">Let&apos;s make today manageable.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden lg:col-span-2" glass>
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Your calm score</p>
          {loading ? (
            <Skeleton className="mt-4 h-24 w-24" />
          ) : (
            <div className="mt-4 flex items-center gap-6">
              <ProgressRing value={calmScore} size={110} strokeWidth={10} />
              <p className="max-w-xs text-sm text-inkmute">
                {calmScore >= 65
                  ? "You're doing better than yesterday. Keep noticing what's working."
                  : "It's okay for today to feel harder. One small step is enough."}
              </p>
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Check-in streak</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-peach-soft text-orange-600">
              <Flame size={20} />
            </span>
            <div>
              <p className="font-utility text-2xl font-bold text-ink">{loading ? "–" : streak} day{streak === 1 ? "" : "s"}</p>
              <p className="text-xs text-inkmute">{loading ? "" : `${calmPoints} calm points earned`}</p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Quick reset</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-skyc-soft text-blue-600">
              <Wind size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">2 minutes</p>
              <Link to="/app/unwind" className="text-xs font-semibold text-lavender-deep">
                Breathe or unwind →
              </Link>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Study progress</p>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-24" />
          ) : (
            <>
              <p className="mt-2 font-utility text-2xl font-bold text-ink">
                {completed} / {total || 0}
              </p>
              <p className="text-xs text-inkmute">tasks complete</p>
            </>
          )}
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Next exam</p>
          {loading ? (
            <Skeleton className="mt-3 h-8 w-24" />
          ) : upcoming ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-peach-soft text-orange-600">
                <CalendarClock size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{upcoming.subject}</p>
                <p className="text-xs text-inkmute">{daysUntil} day{daysUntil === 1 ? "" : "s"}</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-inkmute">No exams scheduled yet.</p>
          )}
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Start a focus session</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lavender-soft text-lavender-deep">
              <Timer size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">25-minute Pomodoro</p>
              <Link to="/app/focus" className="text-xs font-semibold text-lavender-deep">
                Open Focus Timer →
              </Link>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Today&apos;s focus</p>
          <div className="mt-2 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lavender-soft text-lavender-deep">
              <Sparkles size={18} />
            </span>
            {todaysFocus ? (
              <div>
                <p className="text-sm font-semibold text-ink">{todaysFocus.subject}</p>
                <p className="text-sm text-inkmute">{todaysFocus.task}</p>
                <Link to="/app/focus" className="mt-1 inline-block text-xs font-semibold text-lavender-deep">
                  Start a focus session →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-inkmute">Nothing urgent on your plate. A good moment to check in on how you're feeling, or review a flashcard deck.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
