# NexCreator AI v3.5 🚀
### Autonomous 24/7 TikTok Affiliate Virtual Studio & Cloud Agentic AI

**NexCreator AI** adalah platform *Virtual Creator Studio* berbasis Agentic AI dan Cloud yang dirancang untuk mengotomatisasi seluruh siklus bisnis TikTok Affiliate mulai dari riset produk harian, pembedahan naskah kompetitor, sintesis suara natural dan karakter AI hiper-realistis (LivePortrait), hingga penjadwalan pos otomatis dan laporan eksekutif harian.

---

## 🏗️ Arsitektur Sistem 6-Node Autonomous Pipeline

1. **Node 01 (Crawl4AI Scraper):** Menyisir katalog TikTok Shop untuk memfilter produk dengan komisi di atas 12% dan tren penjualan 7 hari menanjak.
2. **Node 02 (Whisper AI STT):** Mengekstrak transkrip audio dari video kompetitor yang viral.
3. **Node 03 (Dify + Gemini ATM):** Membedah formula *Amati-Tiru-Modifikasi* (ATM) untuk meracik naskah berdaya retensi tinggi di 3 detik pertama.
4. **Node 04 (F5-TTS Indonesia):** Menyintesis vokal percakapan natural Bahasa Indonesia bernada santai lengkap dengan jeda napas.
5. **Node 05 (LivePortrait + FFmpeg):** Menggerakkan ekspresi wajah avatar AI secara sinkron (*lip-sync*) dan merakit video vertikal 9:16 HD.
6. **Node 06 (Postiz & Supabase):** Menjadwalkan publikasi otomatis ke TikTok dan mengirimkan laporan kinerja harian ke Telegram.

---

## 🗄️ Skema Database Supabase (PostgreSQL)

Platform ini terhubung secara *real-time* ke database Cloud Supabase dengan tabel inti:
* `products`: Menyimpan data produk pemenang TikTok Shop dan hook kompetitor.
* `atm_scripts`: Menyimpan variasi naskah berformat segmen waktu (0-3s, 3-15s, 15-25s, 25-30s).
* `video_queue`: Mengelola antrean render dan status publikasi (Postiz worker).
* `tiktok_accounts`: Manajemen multi-akun TikTok otomatis.

---

## 🚀 Cara Menjalankan Secara Lokal / Deploy

1. **Clone repositori ini:**
   ```bash
   git clone [https://github.com/USERNAME_ANDA/nexcreator-ai-saas.git](https://github.com/USERNAME_ANDA/nexcreator-ai-saas.git)
   cd nexcreator-ai-saas