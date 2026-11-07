import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AtmScript,
  FinancialSnapshot,
  Product,
  QueueItem,
} from "./types";
import { uid } from "./types";

export const LS_KEY = "nexcreator-v5";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  error?: boolean;
}

interface NexState {
  products: Product[];
  scripts: AtmScript[];
  queue: QueueItem[];
  snapshots: FinancialSnapshot[];
  toasts: Toast[];
  sampleLoaded: boolean;

  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;

  addProduct: (p: Omit<Product, "id" | "createdAt">) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setProducts: (ps: Product[]) => void;

  addScript: (s: Omit<AtmScript, "id" | "createdAt">) => AtmScript;
  deleteScript: (id: string) => void;

  addQueue: (q: Omit<QueueItem, "id" | "createdAt">) => QueueItem;
  updateQueue: (id: string, patch: Partial<QueueItem>) => void;
  deleteQueue: (id: string) => void;

  addSnapshot: (s: Omit<FinancialSnapshot, "id" | "createdAt">) => FinancialSnapshot;
  deleteSnapshot: (id: string) => void;

  loadSample: () => void;
  clearSample: () => void;
  resetAll: () => void;
}

const now = () => new Date().toISOString();

export const SAMPLE_PRODUCTS: Omit<Product, "id" | "createdAt">[] = [
  {
    name: "Rak Susun Lipat Portabel Besi Baja",
    category: "Home",
    price: 85000,
    commissionPct: 15,
    sold7d: 4210,
    viralScore: 96,
    competitorHook:
      "Nyesel banget baru tahu ada rak lipat sekuat ini pas kamar kos udah sumpek parah!",
    sourceUrl: "",
    isWinning: true,
    isSample: true,
  },
  {
    name: "TWS Earbuds Gaming Low Latency",
    category: "Gadget",
    price: 115000,
    commissionPct: 12,
    sold7d: 3190,
    viralScore: 92,
    competitorHook:
      "Jangan beli TWS mahal-mahal kalau yang harga seratus ribuan ini suaranya bikin merinding!",
    sourceUrl: "",
    isWinning: true,
    isSample: true,
  },
  {
    name: "Mop Pel Lantai Putar Otomatis",
    category: "Home",
    price: 69000,
    commissionPct: 18,
    sold7d: 5840,
    viralScore: 98,
    competitorHook:
      "Tangan gak perlu nyentuh air kotor lagi tiap ngepel, rahasianya ada di alat 60 ribuan ini.",
    sourceUrl: "",
    isWinning: true,
    isSample: true,
  },
  {
    name: "Lampu Meja LED Eye-Care Rechargeable",
    category: "Gadget",
    price: 55000,
    commissionPct: 14,
    sold7d: 2140,
    viralScore: 88,
    competitorHook:
      "Mati lampu pas lembur? Lampu meja estetik ini tahan nyala 12 jam tanpa colok listrik.",
    sourceUrl: "",
    isWinning: false,
    isSample: true,
  },
  {
    name: "Serum Niacinamide Brightening 20ml",
    category: "Beauty",
    price: 62000,
    commissionPct: 20,
    sold7d: 3560,
    viralScore: 90,
    competitorHook:
      "Skincare 60 ribuan ini bikin muka kusam temenku glowing dalam dua minggu, serius!",
    sourceUrl: "",
    isWinning: false,
    isSample: true,
  },
];

const SAMPLE_SNAPSHOTS: Omit<FinancialSnapshot, "id" | "createdAt">[] = [
  { date: "2026-11-04", commissionRp: 42000, orders: 3, views: 18400, isSample: true },
  { date: "2026-11-05", commissionRp: 67500, orders: 5, views: 24100, isSample: true },
  { date: "2026-11-06", commissionRp: 54000, orders: 4, views: 20900, isSample: true },
];

export const useNexStore = create<NexState>()(
  persist(
    (set, get) => ({
      products: [],
      scripts: [],
      queue: [],
      snapshots: [],
      toasts: [],
      sampleLoaded: false,

      pushToast: (t) => {
        const id = uid();
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
        setTimeout(() => get().dismissToast(id), 4200);
      },
      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      addProduct: (p) => {
        const item: Product = { ...p, id: uid(), createdAt: now() };
        set((s) => ({ products: [item, ...s.products] }));
        return item;
      },
      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      setProducts: (ps) => set({ products: ps }),

      addScript: (s) => {
        const item: AtmScript = { ...s, id: uid(), createdAt: now() };
        set((st) => ({ scripts: [item, ...st.scripts].slice(0, 100) }));
        return item;
      },
      deleteScript: (id) =>
        set((s) => ({ scripts: s.scripts.filter((x) => x.id !== id) })),

      addQueue: (q) => {
        const item: QueueItem = { ...q, id: uid(), createdAt: now() };
        set((s) => ({ queue: [item, ...s.queue] }));
        return item;
      },
      updateQueue: (id, patch) =>
        set((s) => ({
          queue: s.queue.map((q) => (q.id === id ? { ...q, ...patch } : q)),
        })),
      deleteQueue: (id) =>
        set((s) => ({ queue: s.queue.filter((q) => q.id !== id) })),

      addSnapshot: (s) => {
        const item: FinancialSnapshot = { ...s, id: uid(), createdAt: now() };
        set((st) => ({
          snapshots: [...st.snapshots, item].sort((a, b) =>
            a.date.localeCompare(b.date),
          ),
        }));
        return item;
      },
      deleteSnapshot: (id) =>
        set((s) => ({
          snapshots: s.snapshots.filter((x) => x.id !== id),
        })),

      loadSample: () => {
        if (get().sampleLoaded) return;
        const products = SAMPLE_PRODUCTS.map((p) => ({
          ...p,
          id: uid(),
          createdAt: now(),
        }));
        const snapshots = SAMPLE_SNAPSHOTS.map((s) => ({
          ...s,
          id: uid(),
          createdAt: now(),
        }));
        set((s) => ({
          products: [...products, ...s.products],
          snapshots: [...s.snapshots, ...snapshots],
          sampleLoaded: true,
        }));
      },
      clearSample: () =>
        set((s) => ({
          products: s.products.filter((p) => !p.isSample),
          scripts: s.scripts.filter((x) => !x.isSample),
          queue: s.queue.filter((q) => !q.isSample),
          snapshots: s.snapshots.filter((x) => !x.isSample),
          sampleLoaded: false,
        })),
      resetAll: () =>
        set({ products: [], scripts: [], queue: [], snapshots: [], sampleLoaded: false }),
    }),
    {
      name: LS_KEY,
      // Simpan hanya data kerja — TIDAK PERNAH ada API key / token di sini.
      partialize: (s) => ({
        products: s.products,
        scripts: s.scripts,
        queue: s.queue,
        snapshots: s.snapshots,
        sampleLoaded: s.sampleLoaded,
      }),
    },
  ),
);

/** Apakah Supabase live terkonfigurasi (client-side: hanya cek env publik). */
export const isSupabaseEnvPresent = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
