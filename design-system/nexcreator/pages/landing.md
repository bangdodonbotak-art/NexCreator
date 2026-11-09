# Landing — Page Override (2026-11-10)

> Override ini menang atas `MASTER.md` untuk route `/` saja.
> Sumber arah: standing rule Dony 2026-11-09 (Threads @heytanzil, anti AI slop)
> + riset 2026-11-10 atas jiro.build, supahero.io, styles.refero.design,
> designspells.com, mobbin.com. Tidak ada langganan berbayar yang dipakai
> (Jiro MCP dan Mobbin Pro TIDAK dibeli — browsing gratis saja).

## Hero — pola Linear (Supahero)

- Satu headline tengah + satu kalimat pendukung + SATU CTA utama + SATU visual.
- Headline Cormorant 64px desktop (`md:text-[4rem]`), tracking ketat,
  3 baris max. Baris aksen emerald, tanpa italic di dalam heading.
- Visual tunggal: Hero3D (ponsel 9:16 + koin + cincin) di BAWAH headline,
  tengah, dengan glow sinematik (`.hero-glow`). Koin/partikel = garnish,
  bukan saingan headline. Tanpa gradient ungu, tanpa kartu bertumpuk di hero.
- Headline + kalimat + CTA utama harus terlihat di 1280x800 tanpa scroll.

## Nav — pill minimal mengambang (Jiro + Superhuman)

- Pill `rounded-full`, glass + `backdrop-blur-xl`, border 1px, melayang
  (`fixed top-3/4`), logo + 3 link (Alur, Modul, Fase) + Masuk + Buka Studio.
- Link nav = body face, sentence case, tanpa tracked capitals.

## Token — satu aksen per elemen (Refero Slash / Atoms / Inngest)

- Emas `#C9A227` = CTA utama (pill isi penuh + teks gelap `#1A1405`),
  hairline, angka, badge. Emerald `#10B981` = aksen fungsional
  (status, ikon, baris aksen headline). Jangan pernah pakai emas + emerald
  dalam SATU elemen yang sama.
- CTA utama landing SELALU pill emas. Tombol sekunder = outline/ghost.
- Kedalaman dari hairline border + backdrop blur, bukan drop shadow
  (shadow hanya glow emas halus saat hover CTA).
- Serif (Cormorant) hanya headline ≥28px; sans (Montserrat) untuk UI/body.

## Gerak — resep DesignSpells (pilih 3–5 spell saja)

- CTA hover: naik halus + glow emas muncul, 150ms. (Base Button sudah
  punya `hover:scale`; jangan tambah `transition: all` atau animasi
  width/height.)
- Count-up angka Target Rp5.000.000 saat masuk viewport
  (`components/landing/CountUp.tsx`). Hanya angka NYATA yang dianimasikan —
  progres 0% dan Rp0 tercatat tetap apa adanya, tidak dikarang.
- Hormati `prefers-reduced-motion`: semua animasi punya fallback statis.

## Alur — stepper onboarding (Mobbin)

- Bab 2 "Alur 4 langkah" = stepper horizontal: lingkaran angka emas +
  hairline penghubung emas di desktop, satu langkah aktif, sisanya redup.
- Section Target: garis gradient emas (gilded gradient) hanya untuk
  visual progres — progres 0% yang jujur jadi elemen desain, bukan
  kekurangan yang disembunyikan.

## Yang TIDAK boleh

- Tidak ada metrik, testimoni, logo wall, atau angka yang dikarang.
- Target Rp5.000.000/bulan selalu berlabel GOAL, progres 0%, "Belum ada
  snapshot komisi — mulai dari Rp0".
- Tidak ada gradient ungu-biru, kartu di dalam kartu, emoji sebagai ikon.

## Aturan aksen — emas vs emerald (ATM $10k, 2026-11-10)

- **Emas `#C9A227` = marketing.** CTA utama, headline aksen sekunder,
  hairline, badge, angka target, ScrollProgress. Hanya di landing.
- **Emerald `#10B981` = fungsional app.** Status "Jalan"/"Terhubung",
  ikon modul, tombol aksi di dalam AppShell, progres/sukses.
- Jangan pernah pakai emas + emerald dalam SATU elemen yang sama.
- Pengecualian sadar: garis progres Target (emerald→emas) — progres
  adalah status fungsional di atas kartu marketing; lebarnya 0% jadi
  tidak ada warna yang benar-benar tampil.

## Token — satu sumber kebenaran (ATM $10k, 2026-11-10)

- Semua warna di `@theme` globals.css (`--color-gold`, `--color-ink`,
  `--color-panel`, `--color-line`, `--color-mist`, `--color-fog`, ...).
  Komponen hanya pakai utility token (`bg-gold`, `text-mist`,
  `border-line`); literal hex di komponen = pelanggaran.
- Warna yang harus dipakai di JS (material Three.js) ada di
  `lib/design-tokens.ts` — cermin @theme, wajib dijaga sinkron.
- Glow CTA sebagai utility (`gold-glow`, `gold-glow-sm`,
  `emerald-glow`); indikator nav aktif sebagai class
  (`.indicator-gold-left` desktop, `.indicator-gold-bottom` mobile).

## Hero — visual asli (ATM $10k, 2026-11-10)

- Layar ponsel hero = mock setia Command Center asli
  (`app/app/command/page.tsx`): header + 4 kartu statistik + 2 baris
  pipeline + tombol "Trigger Content Batch" — di R3F (geometri) DAN
  di StaticHero (CSS, untuk reduced-motion). Angka keadaan kosong yang
  jujur: 0 / Rp0. Jangan screenshot (app butuh login, Supabase paused).
- Canvas `frameloop="demand"` + `FrameDriver` (minta frame ~30fps hanya
  saat canvas terlihat). Parallax pointer ikut ter-update tiap tick.

## Struktur — server components (ATM $10k, 2026-11-10)

- `app/page.tsx` = server component (487 baris). Client islands hanya:
  `sections/Hero.tsx` (nav + hero + motion), `CountUp`,
  `TiltCard`, `Reveal`, `LenisProvider`, `ScrollProgress`.
- Anchor `#masalah` / `#alur` / `#modul` / `#fase` wajib hidup —
  dicegat Lenis (`lenis.scrollTo`, offset -80); CSS
  `scroll-behavior: smooth` dihapus supaya tidak bentrok.
- `CountUp`: state awal = nilai akhir (SSR/ tanpa JS angkanya benar);
  animasi 0→target hanya saat inView + JS aktif.
- Meta: `metadataBase` + openGraph + twitter + `favicon.svg` di
  `app/layout.tsx`; `app/sitemap.ts` (hanya rute publik) +
  `app/robots.ts` (disallow `/api/`).
- Reduced-motion: `motion-safe:animate-bounce/pulse` di komponen +
  guard media query di globals.css (marquee, bounce, pulse, spin mati).
