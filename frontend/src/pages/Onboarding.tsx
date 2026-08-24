import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import AuroraBackground from "../components/ui/AuroraBackground";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { User } from "../types";

const challenges = ["Staying focused", "Exam anxiety", "Time management", "Too much workload", "Getting enough rest"];

export default function Onboarding() {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboarded && !done) return <Navigate to="/app/today" replace />;

  const finish = async () => {
    setSubmitting(true);
    try {
      const res = await api.post<{ user: User }>("/user/onboard");
      setUser(res.user);
      setDone(true);
      setTimeout(() => navigate("/app/today", { replace: true }), 1400);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <AuroraBackground variant="subtle" />
      <Card className="relative w-full max-w-lg text-center">
        {done ? (
          <>
            <h1 className="font-display text-2xl font-bold text-ink">Your CalmCampus space is ready.</h1>
            <p className="mt-2 text-sm text-inkmute">Taking you to your dashboard…</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-ink">Let&apos;s personalize CalmCampus</h1>
            <p className="mt-2 text-sm text-inkmute">
              You&apos;re studying {user.course || "your course"} · {user.year || "current year"}
            </p>

            <p className="mt-8 text-left text-sm font-medium text-ink">What&apos;s your biggest challenge right now?</p>
            <div className="mt-3 grid gap-2">
              {challenges.map((c) => (
                <button
                  key={c}
                  onClick={() => setChallenge(c)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    challenge === c ? "border-lavender-deep bg-lavender-soft text-lavender-deep" : "border-ink/10 bg-white text-ink hover:border-lavender-deep"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <Button className="mt-8 w-full" disabled={!challenge || submitting} onClick={finish}>
              {submitting ? "Setting up…" : "Continue"}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
