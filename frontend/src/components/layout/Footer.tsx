import { Link } from "react-router-dom";
import { Waves } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-ink/5 bg-canvas">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-lavender-soft text-lavender-deep">
                <Waves size={16} strokeWidth={2.5} />
              </span>
              CalmCampus AI
            </div>
            <p className="mt-2 text-sm text-inkmute">Your calm space for exam season.</p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-inkmute sm:grid-cols-3" aria-label="Footer">
            <Link to="/#features" className="hover:text-ink">About</Link>
            <Link to="/#features" className="hover:text-ink">Features</Link>
            <Link to="/privacy#security" className="hover:text-ink">Security</Link>
            <Link to="/privacy" className="hover:text-ink">Privacy</Link>
            <Link to="/resources" className="hover:text-ink">Resources</Link>
            <a href="mailto:hello@calmcampus.example" className="hover:text-ink">Contact</a>
          </nav>
        </div>

        <p className="mt-10 max-w-2xl text-xs leading-relaxed text-inkmute">
          CalmCampus AI is an academic and wellbeing support tool and is not a substitute for professional
          medical or psychological care.
        </p>
      </div>
    </footer>
  );
}
