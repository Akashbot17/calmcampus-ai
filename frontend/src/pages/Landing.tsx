import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  GraduationCap,
  Clock,
  BrainCircuit,
  Moon,
  ListTree,
  Users,
  MessageCircle,
  SmilePlus,
  ListChecks,
  Wind,
  Timer,
  BookOpen,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AuroraBackground from "../components/ui/AuroraBackground";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProgressRing from "../components/ui/ProgressRing";

const problems = [
  { icon: BrainCircuit, title: "Overthinking", text: "Your mind keeps replaying everything you haven't studied yet." },
  { icon: Moon, title: "Sleep disruption", text: "Late-night studying can make tomorrow even harder." },
  { icon: ListTree, title: "Study pressure", text: "Too much to do can make it difficult to know where to start." },
  { icon: Users, title: "Feeling alone", text: "Sometimes you simply need somewhere to put your thoughts." },
];

const solutions = [
  { icon: MessageCircle, title: "AI Support", text: "Talk to CalmCampus AI about academic pressure and everyday exam stress." },
  { icon: SmilePlus, title: "Mood Check-ins", text: "Record how you're feeling and build a streak — small, consistent check-ins add up." },
  { icon: ListChecks, title: "Smart Study Planning", text: "Break large academic goals into smaller, manageable tasks." },
  { icon: Timer, title: "Focus Timer", text: "Pomodoro-style focus sessions tied to what you're actually studying." },
  { icon: Wind, title: "Unwind Zone", text: "Breathing exercises and two calm, mind-relaxing games for a real break." },
  { icon: BookOpen, title: "Student Resources", text: "Discover practical resources for study planning and academic wellbeing." },
];

const steps = [
  { n: "01", title: "Check In", text: "Tell CalmCampus how you're feeling." },
  { n: "02", title: "Talk", text: "Have a private conversation with the AI assistant." },
  { n: "03", title: "Understand", text: "Review mood and study patterns." },
  { n: "04", title: "Take Action", text: "Get small, practical suggestions for your next step." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
              Exam pressure is real. You don&apos;t have to face it alone.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-inkmute">
              CalmCampus AI gives students a private, supportive space to talk through exam stress, organize their
              study goals, understand their mood, and find small moments of calm.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register"><Button size="lg">Start Free</Button></Link>
              <a href="#features"><Button size="lg" variant="secondary">Explore Features</Button></a>
            </div>

            <div className="mt-12 flex flex-wrap gap-6 text-sm text-inkmute">
              <span className="flex items-center gap-2"><Lock size={16} /> Private by design</span>
              <span className="flex items-center gap-2"><ShieldCheck size={16} /> Secure data handling</span>
              <span className="flex items-center gap-2"><GraduationCap size={16} /> Student-focused</span>
              <span className="flex items-center gap-2"><Clock size={16} /> Available anytime</span>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <Card glass className="animate-floaty">
              <p className="text-xs font-semibold uppercase tracking-wide text-inkmute">Today&apos;s check-in</p>
              <p className="mt-1 text-sm text-ink">How are you feeling?</p>
              <div className="mt-4 flex items-center justify-between">
                <ProgressRing value={72} size={92} strokeWidth={9} label="Calm" />
                <div className="text-right">
                  <p className="text-xs text-inkmute">Study progress</p>
                  <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-lavender-soft">
                    <div className="h-full w-[78%] rounded-full bg-lavender-deep" />
                  </div>
                  <p className="mt-1 text-xs text-inkmute">78%</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-mint-soft p-4">
                <p className="text-xs font-semibold text-emerald-700">Next exam</p>
                <p className="text-sm text-ink">Cyber Security · in 4 days</p>
              </div>
            </Card>
            <Card className="absolute -bottom-8 -left-6 hidden w-56 animate-floaty [animation-delay:1.2s] sm:block">
              <p className="text-xs font-semibold text-inkmute">CalmCampus AI</p>
              <p className="mt-1 text-sm text-ink">&ldquo;Let&apos;s make it smaller — which exam feels most urgent?&rdquo;</p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Exam season changes everything.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <Card key={p.title} className="transition-transform hover:-translate-y-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-peach-soft text-orange-600">
                <p.icon size={20} />
              </span>
              <h3 className="mt-4 font-display font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-sm text-inkmute">{p.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">A calmer way to navigate exam season.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => (
            <Card key={s.title} className="transition-transform hover:-translate-y-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lavender-soft text-lavender-deep">
                <s.icon size={20} />
              </span>
              <h3 className="mt-4 font-display font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-inkmute">{s.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">How it works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span className="font-utility text-4xl font-extrabold text-lavender-soft">{s.n}</span>
              <h3 className="mt-2 font-display font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-inkmute">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <Card glass className="relative overflow-hidden text-center">
          <AuroraBackground variant="subtle" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">Your calm space is one check-in away.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-inkmute">
              Free to start. No pressure, no diagnosis — just a calmer way through exam season.
            </p>
            <Link to="/register" className="mt-6 inline-block">
              <Button size="lg">Start Your Calm Journey</Button>
            </Link>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
