export type Category = "Home" | "Gadget" | "Beauty" | "Fashion" | "Other";

export type Provenance = "Real" | "Manual" | "Estimasi";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  commissionPct: number;
  sold7d: number;
  viralScore: number;
  competitorHook: string;
  sourceUrl: string;
  isWinning: boolean;
  isSample?: boolean;
  createdAt: string;
}

export const commissionRp = (p: Pick<Product, "price" | "commissionPct">) =>
  Math.round((p.price * p.commissionPct) / 100);

export type Archetype =
  | "POV"
  | "SHOCK"
  | "PROBLEM_SOLVER"
  | "STORYTELLING"
  | "BEFORE_AFTER"
  | "UNBOXING";

export const ARCHETYPES: { id: Archetype; label: string; desc: string }[] = [
  { id: "POV", label: "POV Curhat", desc: "Sudut pandang orang pertama, curhat jujur soal masalah sehari-hari." },
  { id: "SHOCK", label: "Shock Review", desc: "Fakta mengejutkan di 3 detik pertama, lalu bukti." },
  { id: "PROBLEM_SOLVER", label: "Problem Solver", desc: "Masalah → solusi cepat → bukti demo." },
  { id: "STORYTELLING", label: "Storytelling", desc: "Cerita pendek dengan konflik dan perubahan." },
  { id: "BEFORE_AFTER", label: "Before / After", desc: "Kontras kondisi sebelum dan sesudah pakai produk." },
  { id: "UNBOXING", label: "Unboxing", desc: "Buka paket, reaksi jujur, tes fungsi langsung." },
];

export interface AtmScript {
  id: string;
  productId: string;
  productName: string;
  archetype: Archetype;
  hook: string;
  body: string;
  demo: string;
  cta: string;
  score: number;
  source: "local" | "gemini" | "argon";
  isSample?: boolean;
  createdAt: string;
}

export type VideoStatus =
  | "DRAFT"
  | "QUEUED_RENDER"
  | "RENDERING"
  | "READY_TO_POST"
  | "POSTED"
  | "FAILED";

export const VIDEO_STATUSES: { id: VideoStatus; label: string }[] = [
  { id: "DRAFT", label: "Draft" },
  { id: "QUEUED_RENDER", label: "Antre Render" },
  { id: "RENDERING", label: "Sedang Render" },
  { id: "READY_TO_POST", label: "Siap Posting" },
  { id: "POSTED", label: "Sudah Posting" },
  { id: "FAILED", label: "Gagal" },
];

export type ScheduleSlot = "12:15" | "17:30" | "20:00";

export const SCHEDULE_SLOTS: ScheduleSlot[] = ["12:15", "17:30", "20:00"];

export interface QueueItem {
  id: string;
  title: string;
  productName: string;
  characterName: string;
  account: string;
  scheduleTime: ScheduleSlot;
  status: VideoStatus;
  views: number;
  scriptId?: string;
  isSample?: boolean;
  createdAt: string;
}

export interface FinancialSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  commissionRp: number;
  orders: number;
  views: number;
  isSample?: boolean;
  createdAt: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  pitch: number;
}

export const PERSONAS: Persona[] = [
  { id: "rania", name: "Rania Putri", role: "Anak Kos & Home Living", pitch: 1.2 },
  { id: "dimas", name: "Dimas Prakoso", role: "Reviewer Gadget & Desk Setup", pitch: 0.85 },
  { id: "siti", name: "Siti Nurhaliza", role: "Ibu Muda & Dapur Rapi", pitch: 1.1 },
];

export const ACCOUNTS: { handle: string; niche: string }[] = [
  { handle: "@kamar.estetik.id", niche: "Home & Living" },
  { handle: "@racun.gadget.lokal", niche: "Smart Gadget" },
  { handle: "@rumah.rapi.terus", niche: "Alat Rumah Tangga" },
];

export const MONTHLY_TARGET_RP = 5_000_000;

export const uid = () =>
  `nx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
