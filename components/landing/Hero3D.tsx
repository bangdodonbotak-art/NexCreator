"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  RoundedBox,
  Sparkles,
} from "@react-three/drei";
import {
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { Group } from "three";
import * as THREE from "three";
import { DESIGN_TOKENS as T } from "@/lib/design-tokens";

/**
 * Driver frame untuk frameloop="demand": minta frame baru ~30fps HANYA
 * saat canvas terlihat di viewport (IntersectionObserver). Parallax
 * pointer + bob ponsel ikut ter-update tiap tick tanpa render
 * terus-menerus saat canvas di luar layar. Saat reduced-motion,
 * StaticHero yang dipakai, jadi komponen ini tidak pernah jalan.
 */
function FrameDriver() {
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    let visible = true;
    let id = 0;
    const el = gl.domElement;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(el);
    const tick = () => {
      if (visible) invalidate();
      id = window.setTimeout(tick, 33);
    };
    id = window.setTimeout(tick, 33);
    return () => {
      io.disconnect();
      window.clearTimeout(id);
    };
  }, [invalidate, gl]);
  return null;
}

/**
 * Layar ponsel: mock setia Command Center asli (app/app/command/page.tsx)
 * digambar sebagai CanvasTexture 360x640 — header + 4 kartu statistik +
 * 2 baris pipeline + tombol batch, DENGAN TEKS YANG BISA DIBACA.
 * Angka jujur keadaan kosong: 0 / Rp0 — tidak ada data yang dikarang.
 * Palet layar ikut tema hitam-biru (tombol royal, "Jalan" azure).
 */
function useScreenTexture() {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const W = 360;
    const H = 640;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const rr = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };
    // latar layar
    ctx.fillStyle = T.panelDeep;
    ctx.fillRect(0, 0, W, H);
    // header
    ctx.fillStyle = T.ink;
    rr(16, 16, 328, 46, 12);
    ctx.fill();
    ctx.fillStyle = T.royal;
    ctx.beginPath();
    ctx.arc(38, 39, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = T.fog;
    ctx.font = "600 20px system-ui, -apple-system, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText("Command Center", 56, 40);
    ctx.fillStyle = T.royal;
    rr(272, 26, 56, 26, 13);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 14px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Fase A", 300, 40);
    ctx.textAlign = "left";
    // 4 kartu statistik
    const stats: { value: string; label: string; color: string }[] = [
      { value: "0", label: "Produk terdata", color: T.fog },
      { value: "0", label: "Draft naskah", color: T.fog },
      { value: "0", label: "Antrean aktif", color: T.fog },
      { value: "Rp0", label: "Komisi bulan ini", color: T.azure },
    ];
    stats.forEach((s, i) => {
      const x = 16 + (i % 2) * 172;
      const y = 78 + Math.floor(i / 2) * 132;
      ctx.fillStyle = T.ink;
      rr(x, y, 156, 116, 12);
      ctx.fill();
      ctx.fillStyle = s.color;
      ctx.font = "700 34px system-ui, -apple-system, sans-serif";
      ctx.fillText(s.value, x + 16, y + 46);
      ctx.fillStyle = T.mist;
      ctx.font = "500 15px system-ui, -apple-system, sans-serif";
      ctx.fillText(s.label, x + 16, y + 82);
    });
    // 2 baris pipeline
    const rows: { label: string; status: string; color: string; dot: string }[] = [
      { label: "Hunter · produk winning", status: "Jalan", color: T.go, dot: T.go },
      { label: "Studio · production pack", status: "Belum", color: T.amber, dot: T.amber },
    ];
    rows.forEach((r, i) => {
      const y = 358 + i * 64;
      ctx.fillStyle = T.ink;
      rr(16, y, 328, 52, 12);
      ctx.fill();
      ctx.fillStyle = r.dot;
      ctx.beginPath();
      ctx.arc(38, y + 26, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = T.fog;
      ctx.font = "600 16px system-ui, -apple-system, sans-serif";
      ctx.fillText(r.label, 56, y + 27);
      ctx.fillStyle = r.color;
      ctx.font = "700 15px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(r.status, 328, y + 27);
      ctx.textAlign = "left";
    });
    // tombol batch royal (teks putih — kontras 5,2:1 di atas #2563EB)
    ctx.fillStyle = T.royal;
    rr(16, 556, 328, 52, 26);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 19px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Trigger Content Batch", W / 2, 583);
    ctx.textAlign = "left";
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);
  useEffect(() => {
    return () => {
      tex?.dispose();
    };
  }, [tex]);
  return tex;
}

/** Kilau kaca diagonal di atas layar — pita putih lembut, additive. */
function useGlareTexture() {
  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 180;
    c.height = 330;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const grad = ctx.createLinearGradient(0, 0, 180, 0);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.42, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.6)");
    grad.addColorStop(0.58, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 180, 330);
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => {
    return () => {
      tex?.dispose();
    };
  }, [tex]);
  return tex;
}

/**
 * Ponsel hyper-realistic: bingkai RoundedBox titanium biru-gelap
 * (MeshPhysicalMaterial: metalness 0.9, roughness 0.35, clearcoat 1),
 * layar CanvasTexture Command Center, kilau kaca, tombol samping tipis.
 * Proporsi tetap 9:16.
 */
function Phone() {
  const screenTex = useScreenTexture();
  const glareTex = useGlareTexture();
  return (
    <group>
      {/* bingkai titanium membulat */}
      <RoundedBox args={[1.95, 3.45, 0.16]} radius={0.1} smoothness={4}>
        <meshPhysicalMaterial
          color={T.titanium}
          metalness={0.9}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.15}
          envMapIntensity={2.5}
        />
      </RoundedBox>
      {/* tombol samping: power kanan, volume kiri */}
      <mesh position={[0.99, 0.55, 0]}>
        <boxGeometry args={[0.03, 0.42, 0.07]} />
        <meshStandardMaterial color={T.steelLight} metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[-0.99, 0.72, 0]}>
        <boxGeometry args={[0.03, 0.3, 0.07]} />
        <meshStandardMaterial color={T.steelLight} metalness={1} roughness={0.25} />
      </mesh>
      <mesh position={[-0.99, 0.32, 0]}>
        <boxGeometry args={[0.03, 0.3, 0.07]} />
        <meshStandardMaterial color={T.steelLight} metalness={1} roughness={0.25} />
      </mesh>
      {/* layar: tekstur mock Command Center (teks terbaca). meshBasicMaterial
          supaya teks tajam dan tidak gelap karena pencahayaan scene. */}
      <mesh position={[0, 0, 0.085]}>
        <planeGeometry args={[1.78, 3.28]} />
        {screenTex ? (
          <meshBasicMaterial map={screenTex} toneMapped={false} />
        ) : (
          <meshStandardMaterial color={T.screenDeep} metalness={0.2} roughness={0.4} />
        )}
      </mesh>
      {/* kilau kaca diagonal */}
      {glareTex ? (
        <mesh position={[0, 0, 0.095]} rotation={[0, 0, -0.38]}>
          <planeGeometry args={[1.78, 3.28]} />
          <meshBasicMaterial
            map={glareTex}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

/**
 * Rig gerak ponsel — ganti Float default yang pelan-kaku:
 * entrance naik + settle pakai spring (easeOutCubic 1,1 detik),
 * bob 0.28 + sway rotY 0.14 sinus teredam, resting rotY 0.18 rad
 * (sisi/bevel bingkai terlihat), parallax pointer 0.7/0.45 dengan
 * inersia (lerp), tilt mengikuti scroll hero (spring, maks -0,32 rad
 * saat hero setengah terlewati). Skala settle 1.12. Semua gerak hanya
 * transform — tanpa layout.
 */
function PhoneRig({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const group = useRef<Group>(null);
  const tilt = useSpring(
    useTransform(scrollProgress, [0, 0.45], [0, -0.32], { clamp: true }),
    { stiffness: 55, damping: 18 },
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const e = easeOutCubic(Math.min(1, t / 1.1));
    const targetY = (1 - e) * 0.7 + Math.sin(t * 1.1) * 0.28;
    const targetRotY =
      0.18 + Math.sin(t * 0.4) * 0.14 + state.pointer.x * 0.7;
    const targetRotX = -state.pointer.y * 0.45 + tilt.get();
    const targetRotZ = Math.sin(t * 0.55) * 0.035;
    const kPos = Math.min(1, delta * 4);
    const kRot = Math.min(1, delta * 5);
    g.position.y += (targetY - g.position.y) * kPos;
    g.rotation.y += (targetRotY - g.rotation.y) * kRot;
    g.rotation.x += (targetRotX - g.rotation.x) * kRot;
    g.rotation.z += (targetRotZ - g.rotation.z) * kRot;
    // Skala settle 1.12 (prop scale={1.12} di group dihapus: setScalar
    // di sini menimpa prop itu tiap frame — satu sumber kebenaran).
    g.scale.setScalar(0.88 + 0.24 * e);
  });

  return (
    <group ref={group}>
      <Phone />
    </group>
  );
}

function Scene({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  return (
    <>
      {/* Pencahayaan studio biru — Lightformers via Environment lokal
          (tanpa fetch HDR dari CDN). Key light kiri-depan + directional
          kuat supaya tepi titanium menangkap cahaya biru-steel. */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} />
      <directionalLight position={[-6, 2, 4]} intensity={2.5} color="#BFD7FF" />
      <pointLight position={[-5, -2, 3]} intensity={8} color={T.royal} />
      <pointLight position={[4, -3, 2]} intensity={8} color={T.azure} />
      <Environment resolution={256}>
        <Lightformer
          intensity={6}
          position={[0, 5, 0]}
          rotation-x={Math.PI / 2}
          scale={[10, 10, 1]}
          color="#BFD7FF"
        />
        {/* Lightformer BESAR putih-biru tepat di depan (menghadap ponsel)
            supaya tepi bingkai titanium menangkap highlight lebar. */}
        <Lightformer
          intensity={4}
          position={[0, 0, 5]}
          rotation-y={Math.PI}
          scale={[10, 6, 1]}
          color="#DCE9FF"
        />
        <Lightformer
          intensity={3}
          position={[-5, 1, -1]}
          rotation-y={Math.PI / 2}
          scale={[6, 2, 1]}
          color="#2563EB"
        />
        <Lightformer
          intensity={3}
          position={[5, 0, -1]}
          rotation-y={-Math.PI / 2}
          scale={[6, 2, 1]}
          color="#60A5FA"
        />
        <Lightformer
          intensity={1.5}
          position={[0, -5, 2]}
          scale={[8, 3, 1]}
          color="#0B1E4B"
        />
      </Environment>

      <PhoneRig scrollProgress={scrollProgress} />

      {/* Bayangan kontak di bawah ponsel — jangkar visual "nyata". */}
      <ContactShadows
        position={[0, -2.15, -0.3]}
        opacity={0.55}
        scale={9}
        blur={2.2}
        far={3.2}
        resolution={256}
        color="#000000"
      />

      {/* Debu cahaya biru halus — ganti koin emas + cincin emerald. */}
      <Sparkles
        count={70}
        scale={[8, 5, 2]}
        size={2.2}
        speed={0.45}
        opacity={0.55}
        color="#60A5FA"
      />
    </>
  );
}

/** Fallback statis (CSS) untuk prefers-reduced-motion: komposisi sama, tanpa gerak. */
function StaticHero() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute h-72 w-72 rounded-full bg-royal/15 blur-3xl" />
      <div className="absolute h-56 w-56 rounded-full border border-royal/40" />
      {/* Mock CSS Command Center asli: header + 4 statistik (0 / Rp0,
          keadaan kosong yang jujur) + 2 baris pipeline + tombol batch. */}
      <div className="relative flex aspect-[9/16] h-[78%] flex-col gap-2 rounded-2xl border border-royal/40 bg-panel p-3 shadow-2xl shadow-royal/10">
        <span className="flex items-center gap-1.5 rounded-lg bg-ink px-2 py-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-royal" />
          <span className="h-1.5 w-16 rounded bg-fog/70" />
          <span className="ml-auto h-1.5 w-6 rounded bg-azure/70" />
        </span>
        <span className="grid grid-cols-2 gap-1.5">
          {[
            { value: "0", label: "Produk terdata", tone: "text-fog" },
            { value: "0", label: "Draft naskah", tone: "text-fog" },
            { value: "0", label: "Antrean aktif", tone: "text-fog" },
            { value: "Rp0", label: "Komisi bulan ini", tone: "text-azure" },
          ].map((s) => (
            <span key={s.label} className="rounded-lg bg-ink p-2">
              <span className={`block text-[11px] font-bold leading-none ${s.tone}`}>
                {s.value}
              </span>
              <span className="mt-1 block text-[7px] leading-none text-mist">
                {s.label}
              </span>
            </span>
          ))}
        </span>
        <span className="space-y-1.5">
          <span className="flex items-center gap-1.5 rounded-lg bg-ink px-2 py-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-azure" />
            <span className="h-1.5 flex-1 rounded bg-mist/40" />
            <span className="text-[7px] font-medium text-azure">Jalan</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-ink px-2 py-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span className="h-1.5 flex-1 rounded bg-mist/40" />
            <span className="text-[7px] font-medium text-amber-300">Belum</span>
          </span>
        </span>
        <span className="mt-auto flex h-6 items-center justify-center rounded-full bg-royal text-[8px] font-bold text-white">
          Trigger Content Batch
        </span>
      </div>
      <span className="absolute left-[16%] top-[18%] flex h-12 w-12 items-center justify-center rounded-full border-2 border-royal bg-royal/20 text-lg font-bold text-royal-soft">
        Rp
      </span>
      <span className="absolute bottom-[20%] right-[14%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-azure bg-azure/20 text-xs font-bold text-azure">
        Rp
      </span>
    </div>
  );
}

export default function Hero3D({
  scrollProgress,
}: {
  scrollProgress: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div
      role="img"
      aria-label="Ponsel vertikal 9:16 mengambang menampilkan mock Command Center NexCreator — statistik, pipeline, dan tombol batch — dikelilingi debu cahaya biru"
      className="h-full w-full"
    >
      {reduceMotion ? (
        <StaticHero />
      ) : (
        <Canvas
          camera={{ position: [0, 0, 6.2], fov: 40 }}
          dpr={[1, 1.75]}
          frameloop="demand"
        >
          <FrameDriver />
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      )}
    </div>
  );
}
