import { rp, num, clamp } from "./format";
import type { Archetype, AtmScript, Product } from "./types";
import { uid } from "./types";

/** Klaim yang dilarang — filter kepatuhan TikTok Shop / kebijakan iklan. */
export const BANNED_CLAIMS: { pattern: RegExp; label: string }[] = [
  { pattern: /pasti sembuh/i, label: "Klaim kesembuhan mutlak" },
  { pattern: /100%\s*sembuh/i, label: "Klaim kesembuhan 100%" },
  { pattern: /dijamin sembuh/i, label: "Klaim kesembuhan terjamin" },
  { pattern: /termurah di seluruh dunia/i, label: "Klaim termurah sedunia" },
  { pattern: /garansi kaya mendadak/i, label: "Klaim kaya mendadak" },
  { pattern: /pasti kaya/i, label: "Klaim pasti kaya" },
  { pattern: /terbaik di dunia/i, label: "Klaim superlatif mutlak" },
  { pattern: /tanpa efek samping/i, label: "Klaim tanpa efek samping" },
  { pattern: /obat (ajaib|ampuh)/i, label: "Klaim obat" },
  { pattern: /100%\s*aman/i, label: "Klaim keamanan 100%" },
];

export interface ComplianceResult {
  score: number; // 0-100
  violations: string[];
  passed: boolean;
}

export function checkCompliance(text: string): ComplianceResult {
  const violations = BANNED_CLAIMS.filter((b) => b.pattern.test(text)).map(
    (b) => b.label,
  );
  const score = clamp(100 - violations.length * 25, 0, 100);
  return { score, violations, passed: violations.length === 0 };
}

type Segs = { hook: string; body: string; demo: string; cta: string };

const TEMPLATES: Record<Archetype, (p: Product) => Segs> = {
  POV: (p) => ({
    hook: p.competitorHook || `Nyesel baru tahu ${p.name} ini ada dari dulu!`,
    body: `Jujur awalnya aku pikir barang harga ${rp(p.price)} itu palingan biasa aja. Tapi pas sampai, aku beneran kaget: bahannya kokoh, rapi, dan nggak ada yang bikin kecewa.`,
    demo: `Nih lihat detail ${p.name}. Pasangnya gampang banget, langsung kelihatan bedanya sejak hari pertama dipakai.`,
    cta: `Stoknya mulai tipis dan bisa COD. Cek Keranjang Kuning di pojok kiri bawah sekarang!`,
  }),
  SHOCK: (p) => ({
    hook: `Stop scroll dulu! Ini alasan ${num(p.sold7d)} orang rebutan ${p.name} minggu ini!`,
    body: `Banyak yang tanya di komentar: worth it nggak? Pas aku buka paketnya, finishing-nya setara barang yang harganya jauh di atas ini.`,
    demo: `Langsung kita tes fungsinya: responsif, awet, dan benar-benar ngebantu aktivitas harian jadi lebih hemat waktu.`,
    cta: `Jangan sampai kehabisan, klik Keranjang Kuning buat cek voucher gratis ongkir hari ini!`,
  }),
  PROBLEM_SOLVER: (p) => ({
    hook: `Capek ngalamin masalah yang sama tiap hari? Cukup ${rp(p.price)} buat beresin semuanya!`,
    body: `Dulu aku buang waktu berjam-jam sampai nemu ${p.name} yang lagi ramai di TikTok Shop.`,
    demo: `Sekali pasang beres dalam hitungan detik. Hemat tenaga, hemat tempat, dan awet dipakai lama.`,
    cta: `Amankan harga promonya sekarang di Keranjang Kuning kiri bawah ya!`,
  }),
  STORYTELLING: (p) => ({
    hook: `Temenku ngetawain aku beli ini… sampai dia nyobain sendiri.`,
    body: `Waktu itu aku cuma iseng checkout ${p.name}. Eh, seminggu kemudian dia yang minta link-nya.`,
    demo: `Ini buktinya. Dipakai tiap hari, hasilnya konsisten dan nggak ribet sama sekali.`,
    cta: `Mau nyusul? Link-nya ada di Keranjang Kuning, bisa COD.`,
  }),
  BEFORE_AFTER: (p) => ({
    hook: `Sebelum pakai ${p.name} vs sesudahnya — bedanya bikin aku nggak percaya.`,
    body: `Dulu kamarku sumpek dan berantakan. Sekarang, dengan ${rp(p.price)} aja, semuanya jadi rapi dan gampang dicari.`,
    demo: `Lihat perbandingannya langsung: kondisi sebelum, lalu sesudah ${p.name} dipakai. Hasilnya kelihatan dalam hitungan detik.`,
    cta: `Mau hasil yang sama? Cek Keranjang Kuning sebelum promonya habis.`,
  }),
  UNBOXING: (p) => ({
    hook: `Unboxing ${p.name} — harga ${rp(p.price)}, isinya bikin aku kaget.`,
    body: `Paketnya rapi, bubble wrap tebal, dan semua bagian lengkap. Buat harga segini, ini di atas ekspektasi aku.`,
    demo: `Kita buka satu-satu dan tes langsung: bahannya solid, fungsinya jalan, dan gampang dipakai siapa aja.`,
    cta: `Kalau kamu mau yang sama, link-nya ada di Keranjang Kuning. Bisa COD!`,
  }),
};

export function generateLocalScript(
  product: Product,
  archetype: Archetype,
): Omit<AtmScript, "id" | "createdAt"> {
  const segs = TEMPLATES[archetype](product);
  const full = [segs.hook, segs.body, segs.demo, segs.cta].join(" ");
  const compliance = checkCompliance(full);
  const words = full.split(/\s+/).filter(Boolean).length;
  const hookWords = segs.hook.split(/\s+/).filter(Boolean).length;
  // Skor kualitas naskah: kepatuhan + hook ringkas + CTA menyebut Keranjang Kuning.
  let score = 40;
  if (compliance.passed) score += 25;
  if (hookWords > 0 && hookWords <= 16) score += 15;
  if (/keranjang kuning/i.test(segs.cta)) score += 10;
  if (words >= 60 && words <= 120) score += 10;
  return {
    productId: product.id,
    productName: product.name,
    archetype,
    ...segs,
    score: clamp(score, 0, 100),
    source: "local",
  };
}

/** Skor ulang naskah yang diedit manual / ditempel dari Argon. */
export function scoreScriptText(segs: Segs): { score: number; violations: string[] } {
  const full = [segs.hook, segs.body, segs.demo, segs.cta].join(" ");
  const compliance = checkCompliance(full);
  const words = full.split(/\s+/).filter(Boolean).length;
  const hookWords = segs.hook.split(/\s+/).filter(Boolean).length;
  let score = 40;
  if (compliance.passed) score += 25;
  if (hookWords > 0 && hookWords <= 16) score += 15;
  if (/keranjang kuning/i.test(segs.cta)) score += 10;
  if (words >= 60 && words <= 120) score += 10;
  return { score: clamp(score, 0, 100), violations: compliance.violations };
}

export function hookVariants(product: Product): string[] {
  return [
    `Nyesel baru tahu ${product.name} ini ada dari dulu!`,
    `Jangan checkout dulu sebelum lihat ${product.name} ini…`,
    `${num(product.sold7d)} orang beli ini minggu lalu, ternyata ini alasannya.`,
    `Harga ${rp(product.price)} tapi hasilnya bikin aku nggak percaya.`,
    `Aku salah banget soal ${product.name}, dan ini buktinya.`,
  ];
}

export function newScriptId(): string {
  return uid();
}
