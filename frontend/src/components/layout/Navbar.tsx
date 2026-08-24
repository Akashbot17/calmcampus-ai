import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Waves } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";

const links = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/#features" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Resources", to: "/resources" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-ink/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lavender-soft text-lavender-deep">
            <Waves size={18} strokeWidth={2.5} />
          </span>
          CalmCampus AI
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="text-sm font-medium text-inkmute hover:text-ink transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button size="sm" onClick={() => navigate("/app/today")}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Log In
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                Start Your Calm Journey
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-xl hover:bg-lavender-soft"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink/5 bg-canvas px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a key={l.to} href={l.to} className="text-sm font-medium text-ink" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            {user ? (
              <Button size="sm" onClick={() => navigate("/app/today")}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={() => navigate("/login")}>
                  Log In
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Start Your Calm Journey
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
