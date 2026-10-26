# NexCreator AI v4 — Cyberpunk TikTok Affiliate Studio

Situs statis (HTML + CSS + JS) + 2 serverless function Vercel. Tanpa build step.

## Struktur
```
index.html
assets/css/style.css
assets/js/config.js     ← URL & anon key Supabase
assets/js/app.js
api/gemini.js           ← proxy Gemini (key di env Vercel)
api/telegram.js         ← proxy Telegram (token di env Vercel)
supabase/schema.sql     ← jalankan sekali di Supabase SQL Editor
vercel.json
```

## Deploy
1. Buat repo GitHub, upload seluruh isi folder ini (`index.html` harus di root repo).
2. vercel.com → **Add New → Project** → import repo → Framework: **Other** → Deploy.
3. **Settings → Environment Variables** (opsional tapi disarankan):
   - `GEMINI_API_KEY`
   - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
   lalu Redeploy.
4. Supabase → SQL Editor → tempel & jalankan `supabase/schema.sql`.
5. Buka situs → ikon ⚙ → **Seed** untuk mengirim data contoh.

## Fitur
- Boot screen, hujan kode, scanline, glitch title, spotlight kartu, animasi count-up
- Command Palette `Ctrl+K`, shortcut `1–6` pindah tab, routing via hash (`#studio`)
- Hunter: cari, filter, sortir, tambah/edit/hapus, impor/ekspor CSV
- Script: 6 archetype, durasi/gaya, Gemini + fallback lokal, Hook Lab A/B, skor & checklist, storyboard, pustaka naskah
- Studio: persona (bisa tambah), pilihan suara browser, caption karaoke 3 gaya, lip-sync sim, ekspor paket produksi JSON (SSML + shot list)
- Publisher: filter status, Publish/Retry/Hapus, timeline jam tayang, laporan Telegram
- Analytics: grafik kategori, radar retensi, heatmap jam, rekomendasi
- Data tersimpan di localStorage dan disinkronkan ke Supabase bila tersedia

## Catatan keamanan
- Anon key Supabase memang publik; keamanan ada di RLS. Policy bawaan `schema.sql` **terbuka untuk semua pemegang anon key** (cocok prototipe pribadi). Untuk dipakai publik, aktifkan Supabase Auth.
- Jangan commit Gemini key / Telegram token. Pakai env Vercel.
- Metrik komisi/views di dashboard adalah **estimasi simulasi**, bukan data TikTok asli. Pipeline (Crawl4AI, Whisper, F5-TTS, LivePortrait, Postiz) belum terhubung ke backend nyata; UI-nya mensimulasikan alur dan menyimpan antrean ke Supabase agar worker eksternal bisa mengambilnya.
