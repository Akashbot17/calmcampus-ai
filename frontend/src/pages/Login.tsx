import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Waves } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AuroraBackground from "../components/ui/AuroraBackground";
import { useAuth, ApiError } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const dest = location.state?.from?.pathname || "/app/today";
      navigate(dest, { replace: true });
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
          <h2 className="font-display text-3xl font-bold leading-snug">Your calm space for exam season.</h2>
          <p className="mt-3 max-w-sm text-sm text-canvas/70">
            A private, supportive place to talk through exam stress and organize your study goals.
          </p>
        </div>
        <p className="relative text-xs text-canvas/50">© {new Date().getFullYear()} CalmCampus AI</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-inkmute">Continue your calm journey.</p>

          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate>
            <Input label="Email" type="email" name="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-inkmute">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-lavender-deep">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
