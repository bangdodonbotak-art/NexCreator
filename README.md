# NexCreator AI V5

Virtual Creator Studio untuk TikTok Affiliate — tanpa tampil di depan kamera.
Rebuild penuh dari v4 (statis) ke Next.js 15 + TypeScript + Supabase.

> **Jujur soal status:** V5 adalah **Fase A** — riset produk, naskah ATM,
> production pack 9:16, antrean + jadwal manual, dan laporan komisi nyata.
> Render video GPU (FFmpeg + LivePortrait + F5-TTS) dan auto-post TikTok
> **belum** jalan — itu Fase B, dengan syarat: >5 video/hari dan komisi
> terverifikasi Rp500.000 pertama. Tidak ada metrik palsu di aplikasi ini:
> setiap angka berlabel **Real / Manual / Estimasi**.

## Stack

- Next.js 15.5 App Router + TypeScript + Tailwind v4 (CSS-first, tanpa `tailwind.config.ts`)
- shadcn-style UI (hand-roll di `components/ui`) + Framer Motion + lucide-react
- TanStack Query + Zustand (persist `localStorage: nexcreator-v5`)
- Recharts (Analytics, data nyata saja)
- Supabase Auth + PostgreSQL + RLS per-user (`@supabase/ssr`)
- Zod (validasi semua input API + CSV)

## Routes

| Route | Isi |
| --- | --- |
| `/` | Landing premium + penjelasan jujur Fase A/B |
| `/auth/login` | Magic link Supabase Auth, atau Mode Demo Lokal |
| `/app/command` | Agregat nyata, Trigger Content Batch, status setup |
| `/app/hunter` | CRUD produk, komisi, CSV import/export |
| `/app/script` | Generator ATM 6 archetype, Hook Lab A/B, paste Argon |
| `/app/studio` | Preview 9:16 + safe-zone, export production pack |
| `/app/publisher` | Antrean, jadwal 12:15/17:30/20:00 WIB, laporan Telegram |
| `/app/analytics` | Snapshot manual Seller Center, target Rp5.000.000/bln |

API: `POST /api/gemini/generate` (gemini-2.5-flash, rate limit 10/menit),
`POST /api/telegram/dispatch`, `GET/POST /api/jobs`, `GET /api/jobs/[id]`,
`GET/POST /api/metrics/snapshot`, `GET /api/setup`.

## Keamanan (non-negotiable)

- RLS: semua tabel punya `user_id` + policy `auth.uid() = user_id`.
  Policy anon-terbuka v4 (`nex_all_*`) di-drop di migrasi.
- **Nol secret di client**: tidak ada panggilan browser ke
  `generativelanguage.googleapis.com` / `api.telegram.org`, tidak ada
  Gemini key / Telegram token di localStorage, tidak ada `.env.local` yang
  di-commit (hanya `.env.example`).
- Gemini/Telegram hanya lewat Route Handler server dengan env.

## Mode Demo Lokal

Supabase masih INACTIVE/paused → app tetap build + jalan tanpa env live.
Data tersimpan di browser (`localStorage: nexcreator-v5`), jelas berlabel
"Mode Demo Lokal". Data contoh hanya bila pengguna menekan "Muat contoh"
dan bisa dihapus.

## Setup (butuh Dony)

1. Restore proyek Supabase **NexCreator** (`obftqgbsrpoonitxjqep`) di dashboard.
2. Jalankan `supabase/migrations/20261107000000_v5_init.sql` di SQL Editor
   (idempotent — aman terhadap tabel v4 lama).
3. Isi env di Vercel (lihat `.env.example`):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
4. TikTok Shop Affiliate: seller authorization + 15 video manual pertama.

## Dev

```bash
npm install
npm run build   # harus exit 0
npm run start   # smoke test: / dan /app/command harus HTTP 200
```

## Perubahan dari v4 (yang dipotong)

- Animasi `setTimeout` 850ms "Run 24/7 Cycle" — dihapus.
- Web Speech yang mengaku F5-TTS — diganti simulasi ritme caption berlabel.
- Chart pendapatan palsu (termasuk Rp482.500) — diganti input manual + chart nyata.
- Hash routing → route persisten `/app/*`; shortcut 1–6 + Cmd+K tetap ada.
