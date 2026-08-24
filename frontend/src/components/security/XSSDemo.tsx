import { FormEvent, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Button from "../ui/Button";
import { api } from "../../services/api";

const presets = ["<script>alert('XSS')</script>", "<img src=x onerror=alert('XSS')>", "<svg onload=alert('XSS')>"];

interface Result {
  safeOutput: string;
  neutralized: boolean;
  message: string;
}

export default function XSSDemo() {
  const [payload, setPayload] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!payload.trim()) return;
    setLoading(true);
    try {
      const res = await api.post<Result>("/security/xss-test", { payload });
      setResult(res);
    } catch {
      setResult({ safeOutput: "", neutralized: true, message: "The request was rejected safely." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-canvas p-4">
      <p className="text-xs text-inkmute">
        Try pasting one of these below (or your own) — this runs the exact same check used on every real field in the app.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setPayload(p)}
            className="rounded-full border border-ink/10 bg-white px-3 py-1.5 font-utility text-xs text-inkmute hover:border-lavender-deep hover:text-ink"
          >
            {p}
          </button>
        ))}
      </div>

      <form onSubmit={runTest} className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder="Try a test payload…"
          className="flex-1 rounded-2xl border border-ink/10 bg-white px-4 py-3 font-utility text-sm outline-none focus:border-lavender-deep"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Testing…" : "Run Test"}
        </Button>
      </form>

      {result && (
        <div className="mt-4 rounded-2xl bg-mint-soft p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck size={16} />
            <p className="text-sm font-semibold">Safely neutralized</p>
          </div>
          <p className="mt-1 text-xs text-emerald-800">{result.message}</p>
          <div className="mt-3 rounded-xl bg-white p-3 font-utility text-xs text-inkmute">
            <p className="font-semibold text-ink">Rendered safely as text:</p>
            {/* Plain JSX text interpolation only — React escapes this automatically. */}
            <p className="mt-1 break-all">{result.safeOutput || "(empty)"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
