# Landing — Page Override (2026-11-10)

> Override ini menang atas `MASTER.md` untuk route `/` saja.
> Sumber arah: standing rule Dony 2026-11-09 (Threads @heytanzil, anti AI slop)
> + riset 2026-11-10 atas jiro.build, supahero.io, styles.refero.design,
> designspells.com, mobbin.com. Tidak ada langganan berbayar yang dipakai
> (Jiro MCP dan Mobbin Pro TIDAK dibeli — browsing gratis saja).
> 2026-11-10: Aurora dari React Bits (gratis, MIT + Commons Clause —
> reactbits.dev TIDAK ADA, yang benar reactbits.dev) + tema hitam-biru
> + ponsel hyper-realistic, atas permintaan Dony ("hero 3D kaku",
> "fit to screen", "ganti dengan hyper realistic").

## Hero — split layout desktop (Supahero + Aurora, ronde 3 2026-11-10)

- SATU visual + satu headline + satu kalimat + SATU CTA utama.
- Headline Cormorant 64px desktop (`md:text-[4rem]`), tracking ketat,
  3 baris max. Baris aksen azure, tanpa italic di dalam heading.
- SPLIT LAYOUT (ronde 3 — keputusan sadar, bukan asal ubah): desktop
  dua kolom — teks RATA KIRI (badge, headline, sub, CTA, chips) di
  kolom kiri, ponsel 3D BESAR di kolom kanan. Headline 3 baris + ponsel
  600px TIDAK PERNAH muat berdampingan vertikal dalam viewport 998px,
  jadi layout centered + flex-1 DIBATALKAN (ponsel jadi miniatur ~110px
  di cek live 04:36 WIB). Mobile tetap stacked rata tengah.
- Ponsel: wadah tinggi EKSPLISIT `h-[68svh] min-h-[480px]` desktop,
  `h-[54svh] min-h-[380px]` mobile — BUKAN flex-1. Kanvas mengisi
  wadah penuh (`h-full w-full`). Kamera z=6.2 fov 40 → ponsel mengisi
  ~86% tinggi kanvas (~580px pada viewport 998, ~466px pada 800).
- Hero FIT-TO-SCREEN: section `min-h-svh` full-bleed. Latar = Aurora
  React Bits (shader WebGL2, pita biru mengalir + mengikuti kursor)
  menutupi seluruh hero; gradient aurora statis DI BAWAH kanvas sebagai
  fallback (WebGL gagal → latar tetap berpita biru, tidak hitam polos);
  vignette atas ringan `from-black/10` supaya pita tetap tegas.
  Tanpa gradient ungu, tanpa kartu bertumpuk di hero.
- Aurora dijeda saat di luar viewport (IntersectionObserver bawaan
  komponen) dan saat tab tersembunyi. Fallback statis (gradient biru)
  untuk prefers-reduced-motion dan sebelum lazy-load selesai.

## Ponsel hyper-realistic (2026-11-10, ronde 3)

- Bingkai `RoundedBox` drei + `MeshPhysicalMaterial` titanium
  `#5B6B8C` (metalness 0.9, roughness 0.2, clearcoat 1,
  envMapIntensity 2.5 — #3A4A6B masih terbaca hitam datar karena
  metalness hanya memantulkan env map yang dominan hitam),
  pencahayaan studio via `Lightformer` di dalam `Environment` lokal
  (TANPA fetch HDR dari CDN — preset Environment dilarang), termasuk
  satu Lightformer BESAR putih-biru tepat di depan (menghadap ponsel,
  highlight lebar di tepi bingkai); `ContactShadows` di bawah ponsel,
  kilau kaca diagonal (additive), tombol samping tipis. Koin emas +
  cincin emerald DIHAPUS (kelihatan mainan) — diganti debu cahaya
  biru (`Sparkles`).
- Layar TETAP mock Command Center (CanvasTexture, teks terbaca:
  "Command Center", 0/Rp0, "Jalan/Belum", "Trigger Content Batch"),
  palet layar ikut tema biru. Proporsi tetap 9:16.
- Gerak (ronde 3): entrance naik + settle spring 1,1 detik, bob 0.28 +
  sway rotY 0.14 sinus teredam, resting rotY 0.18 rad (sisi/bevel
  terlihat), parallax pointer 0.7/0.45 dengan inersia (lerp), tilt
  mengikuti scroll hero (spring, maks -0,32 rad), skala settle 1.12.
  `frameloop="demand"` + `FrameDriver` (~30fps saat terlihat) tetap.

## Nav — pill minimal mengambang (Jiro + Superhuman)

- Pill `rounded-full`, glass + `backdrop-blur-xl`, border 1px, melayang
  (`fixed top-3/4`), logo + 3 link (Alur, Modul, Fase) + Masuk + Buka Studio.
- Link nav = body face, sentence case, tanpa tracked capitals.

## Token — satu aksen per elemen (Refero Slash / Atoms / Inngest)

- Royal `#2563EB` = CTA utama (pill isi penuh + teks PUTIH — kontras
  5,2:1; teks gelap `#06122E` di atas royal hanya 3,7:1 jadi TIDAK
  dipakai untuk CTA), hairline, angka, badge. Azure `#60A5FA` = aksen
  (status "Jalan", ikon, baris aksen headline). Jangan pernah pakai
  royal + azure dalam SATU elemen yang sama (kecuali gradient progres
  Target yang memang transisi).
- CTA utama landing SELALU pill royal. Tombol sekunder = outline/ghost.
- Kedalaman dari hairline border + backdrop blur, bukan drop shadow
  (shadow hanya glow royal halus saat hover CTA).
- Serif (Cormorant) hanya headline ≥28px; sans (Montserrat) untuk UI/body.
- Tema 2026-11-10: HITAM + BIRU — latar `#000000`, panel `#050A18`,
  garis `#16233F`, mist `#93A1B8`. Emas/emerald sudah tidak dipakai di
  landing (token emas di globals.css hanya dipertahankan karena class
  indikator AppShell masih memakainya).

## Gerak — resep DesignSpells (pilih 3–5 spell saja)

- CTA hover: naik halus + glow royal muncul, 150ms. (Base Button sudah
  punya `hover:scale`; jangan tambah `transition: all` atau animasi
  width/height.)
- Aurora mengalir terus di hero (speed 2.0, amplitude 2.2, blend 0.35,
  brightness 1.25, glow 1.0, layers 2) + ponsel bob/sway + parallax
  inersia + tilt scroll (lihat atas).
- Count-up angka Target Rp5.000.000 saat masuk viewport
  (`components/landing/CountUp.tsx`). Hanya angka NYATA yang dianimasikan —
  progres 0% dan Rp0 tercatat tetap apa adanya, tidak dikarang.
- Hormati `prefers-reduced-motion`: semua animasi punya fallback statis.

## Alur — stepper onboarding (Mobbin)

- Bab 2 "Alur 4 langkah" = stepper horizontal: lingkaran angka royal +
  hairline penghubung royal di desktop, satu langkah aktif, sisanya redup.
- Section Target: garis gradient royal→azure hanya untuk
  visual progres — progres 0% yang jujur jadi elemen desain, bukan
  kekurangan yang disembunyikan.

## Yang TIDAK boleh

- Tidak ada metrik, testimoni, logo wall, atau angka yang dikarang.
- Target Rp5.000.000/bulan selalu berlabel GOAL, progres 0%, "Belum ada
  snapshot komisi — mulai dari Rp0".
- Tidak ada gradient ungu-biru, kartu di dalam kartu, emoji sebagai ikon.

## Aturan aksen — royal vs azure (tema hitam-biru, 2026-11-10)

- **Royal `#2563EB` = marketing.** CTA utama, headline aksen sekunder,
  hairline, badge, angka target, ScrollProgress. Hanya di landing.
- **Azure `#60A5FA` = aksen terang.** Status "Jalan", ikon modul,
  baris aksen headline, highlight.
- Jangan pernah pakai royal + azure dalam SATU elemen yang sama.
- Pengecualian sadar: garis progres Target (royal→azure) — progres
  adalah status fungsional di atas kartu marketing; lebarnya 0% jadi
  tidak ada warna yang benar-benar tampil.
- Token emas `#C9A227` di globals.css dipertahankan HANYA karena class
  `.indicator-gold-left/bottom` dipakai AppShell (di luar scope landing).

## Token — satu sumber kebenaran (ATM $10k, 2026-11-10; retheme 2026-11-10)

- Semua warna di `@theme` globals.css (`--color-royal`, `--color-azure`,
  `--color-ink`, `--color-panel`, `--color-line`, `--color-mist`,
  `--color-fog`, ...). Komponen hanya pakai utility token (`bg-royal`,
  `text-mist`, `border-line`); literal hex di komponen = pelanggaran.
- Warna yang harus dipakai di JS (material Three.js) ada di
  `lib/design-tokens.ts` — cermin @theme, wajib dijaga sinkron.
  Material 3D sekarang baja-biru (titanium `#5B6B8C`, steel `#7EA2E8`).
- Glow CTA sebagai utility (`royal-glow`, `royal-glow-sm`); indikator
  nav aktif sebagai class (`.indicator-gold-left` desktop,
  `.indicator-gold-bottom` mobile — milik AppShell, bukan landing).

## Hero — visual asli (ATM $10k, 2026-11-10; hyper-realistic 2026-11-10)

- Layar ponsel hero = mock setia Command Center asli
  (`app/app/command/page.tsx`): header + 4 kartu statistik + 2 baris
  pipeline + tombol "Trigger Content Batch" — di R3F (CanvasTexture,
  teks terbaca) DAN di StaticHero (CSS, untuk reduced-motion). Angka
  keadaan kosong yang jujur: 0 / Rp0. Jangan screenshot (app butuh login,
  Supabase paused).
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
