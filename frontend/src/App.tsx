import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Today from "./pages/Today";
import Chat from "./pages/Chat";
import Mood from "./pages/Mood";
import Planner from "./pages/Planner";
import Flashcards from "./pages/Flashcards";
import Focus from "./pages/Focus";
import Unwind from "./pages/Unwind";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/resources" element={<Resources />} />

          <Route path="/app/today" element={<AppShell><Today /></AppShell>} />
          <Route path="/app/chat" element={<AppShell><Chat /></AppShell>} />
          <Route path="/app/mood" element={<AppShell><Mood /></AppShell>} />
          <Route path="/app/planner" element={<AppShell><Planner /></AppShell>} />
          <Route path="/app/flashcards" element={<AppShell><Flashcards /></AppShell>} />
          <Route path="/app/focus" element={<AppShell><Focus /></AppShell>} />
          <Route path="/app/unwind" element={<AppShell><Unwind /></AppShell>} />
          <Route path="/app/resources" element={<AppShell><Resources /></AppShell>} />
          <Route path="/app/profile" element={<AppShell><Profile /></AppShell>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
