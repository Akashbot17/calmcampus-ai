import { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Card from "../components/ui/Card";
import XSSDemo from "../components/security/XSSDemo";

const sections = [
  {
    title: "What information is collected",
    body: "Account details (name, email, course, year), mood check-ins and notes, study tasks, and the messages you send to the AI assistant.",
  },
  {
    title: "Why information is collected",
    body: "To provide the features you use — your dashboard, mood history, study planner, and AI conversations — and to keep your account secure.",
  },
  {
    title: "How users can delete their data",
    body: "You can permanently delete your account and all associated data at any time from the Profile page.",
  },
  {
    title: "What AI processing means",
    body: "When you message the AI assistant, your message is sent to CalmCampus AI's backend, processed by the AI service, and a response is generated. Your API key or credentials are never exposed to your browser.",
  },
  {
    title: "What information is not collected",
    body: "CalmCampus AI does not collect device location, browsing history outside the app, or contacts. We do not sell user data.",
  },
];

export default function Privacy() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-ink">Privacy &amp; Data Protection</h1>
        <p className="mt-2 text-sm text-inkmute">
          We aim to be clear and specific about what CalmCampus AI collects, why, and how it's kept safe —
          not to make broad claims we can&apos;t back up.
        </p>

        <div className="mt-8 space-y-5">
          {sections.map((s) => (
            <Card key={s.title}>
              <h2 className="font-display font-semibold text-ink">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-inkmute">{s.body}</p>
            </Card>
          ))}

          {/* How content is protected — folded into the privacy page rather than a separate section of the app */}
          <Card id="security">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-mint-soft text-emerald-700">
                <ShieldCheck size={17} />
              </span>
              <div>
                <h2 className="font-display font-semibold text-ink">How your content is protected</h2>
                <p className="mt-2 text-sm leading-relaxed text-inkmute">
                  Every message, mood note, and study note you write is treated as untrusted text — it's
                  validated and cleaned on the server before it's ever stored or shown to you, so it can
                  never run as code in your browser. Passwords are hashed, never stored in plain text, and
                  sessions use secure cookies your browser's JavaScript can't read.
                </p>
                <button
                  onClick={() => setShowDemo((s) => !s)}
                  className="mt-3 flex items-center gap-1 text-sm font-semibold text-lavender-deep"
                >
                  {showDemo ? "Hide the live demo" : "See it in action"}
                  <ChevronDown size={15} className={`transition-transform ${showDemo ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>
            {showDemo && (
              <div className="mt-5">
                <XSSDemo />
              </div>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
