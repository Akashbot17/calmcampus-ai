import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prismaClient";
import { validateBody } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/schemas";
import { requireAuth, signSession, SESSION_COOKIE_OPTIONS, AuthedRequest } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { stripToPlainText } from "../utils/sanitize";

const router = Router();

router.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, course, year } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("An account with this email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        // Names/course/year are free-text fields a user controls — never
        // trust them to be safe HTML even though this is "just a name".
        name: stripToPlainText(name),
        email,
        passwordHash,
        course: course ? stripToPlainText(course) : null,
        year: year ? stripToPlainText(year) : null,
      },
    });

    const token = signSession(user.id);
    res.cookie("session", token, SESSION_COOKIE_OPTIONS);

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, course: user.course, year: user.year, onboarded: user.onboarded },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Same generic error whether the email or password is wrong, to
    // avoid leaking which accounts exist.
    if (!user) throw new AppError("Invalid email or password.", 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError("Invalid email or password.", 401);

    const token = signSession(user.id);
    res.cookie("session", token, SESSION_COOKIE_OPTIONS);

    res.json({
      user: { id: user.id, name: user.name, email: user.email, course: user.course, year: user.year, onboarded: user.onboarded },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("session", { ...SESSION_COOKIE_OPTIONS, maxAge: undefined });
  res.status(200).json({ message: "Logged out." });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) throw new AppError("User not found.", 404);
    res.json({
      user: { id: user.id, name: user.name, email: user.email, course: user.course, year: user.year, onboarded: user.onboarded },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
