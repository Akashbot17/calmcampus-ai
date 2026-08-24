import { Clock } from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const resources = [
  { category: "Study Techniques", title: "A 5-minute reset before studying", read: "2 min read", desc: "A short routine to clear your head before you open your notes." },
  { category: "Exam Preparation", title: "How to break a large syllabus into small tasks", read: "4 min read", desc: "Turning one overwhelming subject into a list you can actually work through." },
  { category: "Time Management", title: "A simple exam-week planning method", read: "5 min read", desc: "A lightweight way to map out the days before an exam without over-scheduling." },
  { category: "Sleep & Rest", title: "Protecting sleep during exam season", read: "3 min read", desc: "Why late-night cramming tends to backfire, and small adjustments that help." },
  { category: "Focus", title: "Working in short, focused sprints", read: "3 min read", desc: "A gentler alternative to marathon study sessions." },
  { category: "Campus Support", title: "Knowing what support is available to you", read: "2 min read", desc: "A reminder of the college resources worth knowing about before you need them." },
];

const categories = Array.from(new Set(resources.map((r) => r.category)));

export default function Resources() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Student Resources</h1>
      <p className="mt-2 text-sm text-inkmute">Practical, bite-sized reading for study planning and academic wellbeing.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Badge key={c} tone="lavender">{c}</Badge>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {resources.map((r) => (
          <Card key={r.title} className="transition-transform hover:-translate-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-lavender-deep">{r.category}</p>
            <h2 className="mt-2 font-display font-semibold text-ink">{r.title}</h2>
            <p className="mt-2 text-sm text-inkmute">{r.desc}</p>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-inkmute">
              <Clock size={13} /> {r.read}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
