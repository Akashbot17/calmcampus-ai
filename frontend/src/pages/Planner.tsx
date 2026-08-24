import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { api } from "../services/api";
import type { Priority, StudyTask } from "../types";

const priorities: Priority[] = ["Low", "Medium", "High"];

export default function Planner() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", task: "", examDate: "", priority: "Medium" as Priority, estimatedHours: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get<{ tasks: StudyTask[] }>("/tasks");
    setTasks(res.tasks);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.task.trim()) return;
    setSaving(true);
    try {
      await api.post("/tasks", {
        subject: form.subject,
        task: form.task,
        examDate: form.examDate || undefined,
        priority: form.priority,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
      });
      setForm({ subject: "", task: "", examDate: "", priority: "Medium", estimatedHours: "" });
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (t: StudyTask) => {
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)));
    await api.put(`/tasks/${t.id}`, { completed: !t.completed });
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await api.delete(`/tasks/${id}`);
  };

  const priorityTone: Record<Priority, "red" | "peach" | "mint"> = { High: "red", Medium: "peach", Low: "mint" };

  const uniqueExams = Array.from(
    new Map(
      tasks
        .filter((t) => t.examDate)
        .map((t) => [t.subject, t.examDate as string])
    ).entries()
  )
    .map(([subject, examDate]) => ({
      subject,
      examDate,
      daysLeft: Math.max(0, Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Make your workload feel smaller.</h1>
        </div>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> Add task
        </Button>
      </div>

      {uniqueExams.length > 0 && (
        <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
          {uniqueExams.map((e) => (
            <Card key={e.subject} className="min-w-[140px] shrink-0 py-3 text-center">
              <p className="truncate text-xs font-semibold text-ink">{e.subject}</p>
              <p className="mt-1 font-utility text-xl font-bold text-lavender-deep">{e.daysLeft}</p>
              <p className="text-[11px] text-inkmute">day{e.daysLeft === 1 ? "" : "s"} left</p>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Card className="mt-6">
          <form onSubmit={addTask} className="grid gap-4 sm:grid-cols-2">
            <Input label="Subject" required maxLength={120} value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Cyber Security" />
            <Input label="Exam date" type="date" value={form.examDate} onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))} />
            <Input
              label="Task"
              required
              maxLength={300}
              className="sm:col-span-2"
              value={form.task}
              onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))}
              placeholder="Revise chapter 4 — network security"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm outline-none focus:border-lavender-deep"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <Input label="Estimated hours" type="number" min={0} max={500} value={form.estimatedHours} onChange={(e) => setForm((f) => ({ ...f, estimatedHours: e.target.value }))} />
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Adding…" : "Add task"}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="mt-8 space-y-3">
        {loading && <p className="text-sm text-inkmute">Loading your study plan…</p>}
        {!loading && tasks.length === 0 && (
          <Card className="text-center text-sm text-inkmute">No tasks yet — add your first study task to get started.</Card>
        )}
        {tasks.map((t) => (
          <Card key={t.id} className={`flex items-start gap-4 ${t.completed ? "opacity-60" : ""}`}>
            <button onClick={() => toggleComplete(t)} aria-label={t.completed ? "Mark incomplete" : "Mark complete"} className="mt-0.5 text-lavender-deep">
              {t.completed ? <CheckCircle2 size={22} /> : <Circle size={22} className="text-ink/20" />}
            </button>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-ink">{t.subject}</p>
                <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
                {t.examDate && <span className="text-xs text-inkmute">Exam: {new Date(t.examDate).toLocaleDateString()}</span>}
              </div>
              <p className={`mt-1 text-sm text-inkmute ${t.completed ? "line-through" : ""}`}>{t.task}</p>
            </div>
            <button onClick={() => deleteTask(t.id)} aria-label="Delete task" className="text-inkmute hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
