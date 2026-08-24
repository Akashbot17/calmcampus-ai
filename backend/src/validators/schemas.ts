import { z } from "zod";

// Every field that reaches the backend is validated here BEFORE any
// controller logic runs. This is the first layer of the XSS/abuse
// defense pipeline: Validation -> Sanitization -> Safe Rendering.

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(150),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[a-z]/, "Needs a lowercase letter")
    .regex(/[A-Z]/, "Needs an uppercase letter")
    .regex(/[0-9]/, "Needs a number")
    .max(128),
  course: z.string().trim().max(100).optional(),
  year: z.string().trim().max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(150),
  password: z.string().min(1).max(128),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  course: z.string().trim().max(100).optional(),
  year: z.string().trim().max(50).optional(),
  studyPreferences: z.string().trim().max(500).optional(),
});

export const messageCreateSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(1000, "Message is too long (max 1000 characters)"),
});

export const conversationCreateSchema = z.object({
  title: z.string().trim().max(120).optional(),
});

export const moodCreateSchema = z.object({
  mood: z.enum(["calm", "okay", "neutral", "stressed", "overwhelmed"]),
  note: z.string().trim().max(1000).optional().default(""),
});

export const taskCreateSchema = z.object({
  subject: z.string().trim().min(1).max(120),
  task: z.string().trim().min(1).max(300),
  examDate: z.string().trim().max(40).optional(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  estimatedHours: z.number().min(0).max(500).optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  completed: z.boolean().optional(),
});

export const xssTestSchema = z.object({
  payload: z.string().max(2000),
});

export const deckCreateSchema = z.object({
  subject: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(150),
});

export const cardCreateSchema = z.object({
  front: z.string().trim().min(1, "Front cannot be empty").max(500),
  back: z.string().trim().min(1, "Back cannot be empty").max(500),
});

export const cardReviewSchema = z.object({
  knewIt: z.boolean(),
});
