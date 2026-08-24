import { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  Home,
  MessageCircle,
  SmilePlus,
  ListChecks,
  Layers,
  Wind,
  Timer,
  BookOpen,
  Settings,
  LogOut,
  Waves,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { label: "Home", to: "/app/today", icon: Home },
  { label: "AI Support", to: "/app/chat", icon: MessageCircle },
  { label: "Mood", to: "/app/mood", icon: SmilePlus },
  { label: "Study Planner", to: "/app/planner", icon: ListChecks },
  { label: "Flashcards", to: "/app/flashcards", icon: Layers },
  { label: "Focus Timer", to: "/app/focus", icon: Timer },
  { label: "Unwind", to: "/app/unwind", icon: Wind },
  { label: "Resources", to: "/app/resources", icon: BookOpen },
];

const mobileItems = [
  { label: "Home", to: "/app/today", icon: Home },
  { label: "Chat", to: "/app/chat", icon: MessageCircle },
  { label: "Mood", to: "/app/mood", icon: SmilePlus },
  { label: "Planner", to: "/app/planner", icon: ListChecks },
  { label: "Profile", to: "/app/profile", icon: Settings },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-inkmute">Loading your calm space…</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-canvas md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/5 bg-white/60 p-6 md:flex">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lavender-soft text-lavender-deep">
            <Waves size={18} strokeWidth={2.5} />
          </span>
          CalmCampus AI
        </Link>

        <nav className="mt-10 flex flex-1 flex-col gap-1" aria-label="Application">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  active ? "bg-lavender-soft text-lavender-deep" : "text-inkmute hover:bg-canvas hover:text-ink"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}

          <div className="my-3 border-t border-ink/5" />

          <Link
            to="/app/profile"
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
              location.pathname === "/app/profile" ? "bg-lavender-soft text-lavender-deep" : "text-inkmute hover:bg-canvas hover:text-ink"
            }`}
          >
            <Settings size={18} />
            Profile
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-inkmute hover:bg-canvas hover:text-ink"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-ink/5 bg-white/90 backdrop-blur-md px-2 py-2 md:hidden"
        aria-label="Application"
      >
        {mobileItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium ${
                active ? "text-lavender-deep" : "text-inkmute"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
