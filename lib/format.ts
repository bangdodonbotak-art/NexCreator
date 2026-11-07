export const rp = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

export const num = (n: number) => Math.round(n).toLocaleString("id-ID");

export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

export const todayWib = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

export const dateId = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));
