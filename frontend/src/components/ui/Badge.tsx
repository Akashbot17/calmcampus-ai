import { ReactNode } from "react";

export default function Badge({ children, tone = "lavender" }: { children: ReactNode; tone?: "lavender" | "mint" | "peach" | "sky" | "red" }) {
  const tones: Record<string, string> = {
    lavender: "bg-lavender-soft text-lavender-deep",
    mint: "bg-mint-soft text-emerald-700",
    peach: "bg-peach-soft text-orange-700",
    sky: "bg-skyc-soft text-blue-700",
    red: "bg-red-50 text-red-600",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
