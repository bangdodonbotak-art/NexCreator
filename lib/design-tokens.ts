/**
 * Cermin token @theme di app/globals.css — untuk warna yang harus dipakai
 * di JavaScript (material Three.js tidak bisa pakai utility Tailwind).
 * SATU sumber kebenaran untuk nilai: kalau ganti nilai di sini, ganti
 * juga di globals.css — dan sebaliknya.
 *
 * Tema 2026-11-10: hitam + biru (royal/azure). Emas/emerald sudah TIDAK
 * dipakai di landing — token emas di globals.css hanya dipertahankan
 * karena class indikator AppShell (.indicator-gold-*) masih memakainya.
 */
export const DESIGN_TOKENS = {
  royal: "#2563EB",
  royalBright: "#3B82F6",
  royalSoft: "#93C5FD",
  royalInk: "#06122E",
  azure: "#60A5FA",
  ink: "#000000",
  panel: "#050A18",
  panelDeep: "#03060F",
  line: "#16233F",
  mist: "#93A1B8",
  fog: "#E8EEF7",
  /** Status "Belum" (amber) — dipakai pipeline Command Center. */
  amber: "#F59E0B",
  /** Status "Jalan" di layar ponsel — biru terang, bukan hijau. */
  go: "#60A5FA",
  /** Nuansa khusus material 3D (bukan token UI). */
  /** Titanium untuk bingkai ponsel hyper-realistic.
      #5B6B8C: baja biru terang — #3A4A6B masih terbaca hitam datar
      karena metalness 0.9 hanya memantulkan env map yang dominan hitam
      (ronde 3: + Lightformer depan + envMapIntensity 2.5). */
  titanium: "#5B6B8C",
  /** Baja terang untuk tombol samping + rim light. */
  steelLight: "#7EA2E8",
  screenDeep: "#04122B",
  /** Debu cahaya biru di sekitar ponsel. */
  dust: "#60A5FA",
} as const;
