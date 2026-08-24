import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import conversationRoutes from "./routes/conversations";
import moodRoutes from "./routes/moods";
import taskRoutes from "./routes/tasks";
import flashcardRoutes from "./routes/flashcards";
import securityRoutes from "./routes/security";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// --- Security headers (Helmet) ---------------------------------------
// A CSP tuned to actually work with this app rather than an overly
// restrictive default that would break Vite/React in dev.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind/utility CSS in dev
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", FRONTEND_URL],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);

// --- CORS: only the configured frontend origin, credentials allowed ---
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" })); // strict content-type + size handling
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/decks", flashcardRoutes);
app.use("/api/security", securityRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CalmCampus AI backend listening on http://localhost:${PORT}`);
  });
}

export default app;
