import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Waves, X } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AuroraBackground from "../components/ui/AuroraBackground";
import { useAuth, ApiError } from "../context/AuthContext";

const requirements = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "upper", label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lower", label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "number", label: "Number", test: (p: string) => /[0-9]/.test(p) },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", course: "", year: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, course: form.course, year: form.year });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-canvas md:flex">
        <AuroraBackground variant="subtle" />
        <Link to="/" className="relative flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">
            <Waves size={18} />
          </span>
          CalmCampus AI
        </Link>
        <div className="relative">
          <h2 className="font-display text-3xl font-bold leading-snug">Let&apos;s make exam season feel a little smaller.</h2>
          <p className="mt-3 max-w-sm text-sm text-canvas/70">Free to start, private by design, built for students.</p>
        </div>
        <p className="relative text-xs text-canvas/50">© {new Date().getFullYear()} CalmCampus AI</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-inkmute">It only takes a minute.</p>

          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate>
            <Input label="Full name" name="name" autoComplete="name" required value={form.name} onChange={update("name")} maxLength={100} />
            <Input label="Email" type="email" name="email" autoComplete="email" required value={form.email} onChange={update("email")} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Course" name="course" placeholder="B.E. CSE" value={form.course} onChange={update("course")} maxLength={100} />
              <Input label="Year" name="year" placeholder="3rd Year" value={form.year} onChange={update("year")} maxLength={50} />
            </div>
            <Input label="Password" type="password" name="password" autoComplete="new-password" required value={form.password} onChange={update("password")} />
            <ul className="grid grid-cols-2 gap-1.5 text-xs">
              {requirements.map((r) => {
                const pass = r.test(form.password);
                return (
                  <li key={r.key} className={`flex items-center gap-1.5 ${pass ? "text-emerald-600" : "text-inkmute"}`}>
                    {pass ? <Check size={13} /> : <X size={13} />}
                    {r.label}
                  </li>
                );
              })}
            </ul>
            <Input
              label="Confirm password"
              type="password"
              name="confirm"
              autoComplete="new-password"
              required
              value={form.confirm}
              onChange={update("confirm")}
            />

            {error && (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-inkmute">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-lavender-deep">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
