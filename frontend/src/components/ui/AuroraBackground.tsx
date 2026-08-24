/**
 * Signature background element: soft, slow-drifting gradient "aurora"
 * blobs in lavender / mint / sky / peach. Used sparingly (hero + a few
 * key moments) rather than on every screen, per the Aurora Calm brief.
 */
export default function AuroraBackground({ variant = "hero" }: { variant?: "hero" | "subtle" }) {
  const opacity = variant === "hero" ? "opacity-70" : "opacity-40";
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${opacity}`} aria-hidden="true">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-lavender/50 blur-3xl animate-driftSlow" />
      <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-mint/50 blur-3xl animate-driftSlow [animation-delay:2s]" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-skyc/50 blur-3xl animate-driftSlow [animation-delay:4s]" />
      <div className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-peach/40 blur-3xl animate-driftSlow [animation-delay:6s]" />
    </div>
  );
}
