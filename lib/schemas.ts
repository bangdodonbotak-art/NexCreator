import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2).max(140),
  category: z.enum(["Home", "Gadget", "Beauty", "Fashion", "Other"]),
  price: z.number().int().min(1).max(100_000_000),
  commissionPct: z.number().min(0).max(100),
  sold7d: z.number().int().min(0).max(10_000_000),
  viralScore: z.number().int().min(0).max(100).optional(),
  competitorHook: z.string().max(300).optional().default(""),
  sourceUrl: z.string().max(500).optional().default(""),
  isWinning: z.boolean().optional().default(false),
});

export const scriptSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  archetype: z.enum([
    "POV",
    "SHOCK",
    "PROBLEM_SOLVER",
    "STORYTELLING",
    "BEFORE_AFTER",
    "UNBOXING",
  ]),
  hook: z.string().min(1).max(500),
  body: z.string().min(1).max(2000),
  demo: z.string().min(1).max(2000),
  cta: z.string().min(1).max(500),
  score: z.number().int().min(0).max(100),
  source: z.enum(["local", "gemini", "argon"]),
});

export const queueSchema = z.object({
  title: z.string().min(1).max(160),
  productName: z.string().min(1),
  characterName: z.string().min(1),
  account: z.string().min(1),
  scheduleTime: z.enum(["12:15", "17:30", "20:00"]),
  status: z.enum([
    "DRAFT",
    "QUEUED_RENDER",
    "RENDERING",
    "READY_TO_POST",
    "POSTED",
    "FAILED",
  ]),
  views: z.number().int().min(0).optional().default(0),
  scriptId: z.string().optional(),
});

export const snapshotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  commissionRp: z.number().int().min(0).max(1_000_000_000),
  orders: z.number().int().min(0).max(100_000),
  views: z.number().int().min(0).max(100_000_000),
});

export const geminiGenerateSchema = z.object({
  prompt: z.string().trim().min(10).max(4000),
});

export const telegramDispatchSchema = z.object({
  text: z.string().trim().min(1).max(4000),
  chatId: z.string().trim().max(100).optional(),
});

export const jobCreateSchema = z.object({
  queueItemId: z.string().min(1),
  title: z.string().min(1).max(160),
  productName: z.string().min(1),
});
