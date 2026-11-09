/**
 * Cermin token @theme di app/globals.css — untuk warna yang harus dipakai
 * di JavaScript (material Three.js tidak bisa pakai utility Tailwind).
 * SATU sumber kebenaran untuk nilai: kalau ganti nilai di sini, ganti
 * juga di globals.css — dan sebaliknya.
 */
export const DESIGN_TOKENS = {
  gold: "#C9A227",
  goldSoft: "#E7C95C",
  goldBright: "#D9B83A",
  goldDeep: "#A16207",
  emerald: "#10B981",
  ink: "#080C14",
  panel: "#0E1524",
  panelDeep: "#0A0F1C",
  line: "#182339",
  mist: "#8A97AD",
  fog: "#E8EEF7",
  /** Status "Belum" (amber) — dipakai pipeline Command Center. */
  amber: "#F59E0B",
  /** Nuansa khusus material 3D (bukan token UI). */
  coinGold: "#D4AF37",
  coinLight: "#F5D76E",
  screenDeep: "#0B2E22",
  mint: "#34D399",
} as const;
