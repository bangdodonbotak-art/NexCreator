"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import type { Group } from "three";
import { DESIGN_TOKENS as T } from "@/lib/design-tokens";

/**
 * Driver frame untuk frameloop="demand": minta frame baru ~30fps HANYA
 * saat canvas terlihat di viewport (IntersectionObserver). Parallax
 * pointer ikut ter-update tiap tick tanpa render terus-menerus saat
 * canvas di luar layar. Saat reduced-motion, StaticHero yang dipakai,
 * jadi komponen ini tidak pernah jalan.
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
 * Hero 3D NexCreator V5: bingkai ponsel 9:16 mengambang + koin komisi emas
 * + cincin emerald + partikel. Parallax mengikuti pointer (mouse & sentuhan
 * lewat state.pointer R3F). Ringan: geometri sederhana, tanpa texture.
 */

function Coin({
  position,
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number];
  scale?: number;
  speed?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.4 * speed;
    ref.current.rotation.x =
      Math.PI / 2.6 + Math.sin(state.clock.elapsedTime * 0.6 * speed) * 0.12;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[1.05, 1.05, 0.14, 48]} />
        <meshStandardMaterial color={T.coinGold} metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.09]}>
        <torusGeometry args={[0.72, 0.045, 16, 64]} />
        <meshStandardMaterial color={T.coinLight} metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.09]}>
        <torusGeometry args={[0.72, 0.045, 16, 64]} />
        <meshStandardMaterial color={T.coinLight} metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Bingkai ponsel 9:16 dengan mock setia Command Center asli
 * (app/app/command/page.tsx): header + 4 kartu statistik + 2 baris
 * pipeline + tombol batch. Angka jujur keadaan kosong: 0 / Rp0 —
 * tidak ada data yang dikarang.
 */
function Phone() {
  // 4 kartu statistik Command Center: nilai kosong (0 / Rp0).
  const stats: { x: number; y: number; accent: string }[] = [
    { x: -0.4, y: 0.95, accent: T.emerald },
    { x: 0.4, y: 0.95, accent: T.gold },
    { x: -0.4, y: 0.32, accent: T.emerald },
    { x: 0.4, y: 0.32, accent: T.gold },
  ];
  // 2 baris pipeline: Hunter jalan, render GPU belum.
  const rows: { y: number; dot: string }[] = [
    { y: -0.42, dot: T.emerald },
    { y: -0.74, dot: T.amber },
  ];
  return (
    <group>
      {/* bodi */}
      <mesh>
        <boxGeometry args={[1.95, 3.45, 0.14]} />
        <meshStandardMaterial color={T.panel} metalness={0.4} roughness={0.35} />
      </mesh>
      {/* layar */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[1.75, 3.25]} />
        <meshStandardMaterial
          color={T.screenDeep}
          emissive={T.emerald}
          emissiveIntensity={0.35}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      {/* header mock: strip + dot emas + garis judul */}
      <mesh position={[0, 1.4, 0.1]}>
        <planeGeometry args={[1.55, 0.26]} />
        <meshStandardMaterial color={T.ink} metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[-0.62, 1.4, 0.12]}>
        <circleGeometry args={[0.07, 24]} />
        <meshStandardMaterial color={T.gold} emissive={T.gold} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[-0.12, 1.4, 0.12]}>
        <planeGeometry args={[0.7, 0.06]} />
        <meshStandardMaterial color={T.mist} metalness={0.1} roughness={0.6} />
      </mesh>
      {/* 4 kartu statistik */}
      {stats.map((c, i) => (
        <group key={i} position={[c.x, c.y, 0]}>
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[0.72, 0.52]} />
            <meshStandardMaterial color={T.ink} metalness={0.2} roughness={0.5} />
          </mesh>
          {/* garis nilai + garis label */}
          <mesh position={[-0.12, 0.1, 0.12]}>
            <planeGeometry args={[0.4, 0.08]} />
            <meshStandardMaterial color={c.accent} emissive={c.accent} emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[-0.06, -0.12, 0.12]}>
            <planeGeometry args={[0.52, 0.05]} />
            <meshStandardMaterial color={T.mist} metalness={0.1} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* 2 baris pipeline */}
      {rows.map((r, i) => (
        <group key={i} position={[0, r.y, 0]}>
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[1.55, 0.24]} />
            <meshStandardMaterial color={T.ink} metalness={0.2} roughness={0.5} />
          </mesh>
          <mesh position={[-0.62, 0, 0.12]}>
            <circleGeometry args={[0.06, 24]} />
            <meshStandardMaterial color={r.dot} emissive={r.dot} emissiveIntensity={0.7} />
          </mesh>
          <mesh position={[0.05, 0, 0.12]}>
            <planeGeometry args={[1.0, 0.05]} />
            <meshStandardMaterial color={T.mist} metalness={0.1} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* tombol batch emas di bawah */}
      <mesh position={[0, -1.38, 0.1]}>
        <planeGeometry args={[1.55, 0.3]} />
        <meshStandardMaterial color={T.gold} emissive={T.gold} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, -1.38, 0.12]}>
        <planeGeometry args={[0.8, 0.07]} />
        <meshStandardMaterial color={T.ink} metalness={0.1} roughness={0.6} />
      </mesh>
    </group>
  );
}

function Scene() {
  const rigRef = useRef<Group>(null);
  const ringRef = useRef<Group>(null);

  useFrame((state, delta) => {
    // Parallax: ikuti pointer (mouse & sentuhan), dilancarkan dengan lerp.
    if (rigRef.current) {
      const targetY = state.pointer.x * 0.28;
      const targetX = -state.pointer.y * 0.18;
      rigRef.current.rotation.y += (targetY - rigRef.current.rotation.y) * Math.min(1, delta * 4);
      rigRef.current.rotation.x += (targetX - rigRef.current.rotation.x) * Math.min(1, delta * 4);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.15;
      ringRef.current.rotation.x =
        Math.PI / 3 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} />
      <pointLight position={[-5, -2, 3]} intensity={12} color={T.emerald} />
      <pointLight position={[4, -3, 2]} intensity={10} color={T.gold} />

      <group ref={rigRef}>
        <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.7}>
          <Phone />
        </Float>

        <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1}>
          <Coin position={[-2.3, 1.2, -0.6]} scale={0.55} speed={1.2} />
        </Float>
        <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.1}>
          <Coin position={[2.3, -1.2, -0.5]} scale={0.45} speed={1} />
        </Float>
        <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.2}>
          <Coin position={[2.4, 1.5, -1]} scale={0.32} speed={1.5} />
        </Float>

        <group ref={ringRef} position={[0, 0.2, -1.4]}>
          <mesh>
            <torusGeometry args={[2.9, 0.03, 16, 100]} />
            <meshStandardMaterial color={T.emerald} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>

        {/* Partikel */}
        {[
          [-1.7, 1.7, -1],
          [1.9, 0.4, -0.6],
          [-2.5, -0.6, 0],
          [1.2, -1.9, -0.4],
          [0.5, 2.0, -0.8],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? T.gold : T.mint}
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

/** Fallback statis (CSS) untuk prefers-reduced-motion: komposisi sama, tanpa gerak. */
function StaticHero() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="absolute h-56 w-56 rounded-full border border-emerald-500/40" />
      {/* Mock CSS Command Center asli: header + 4 statistik (0 / Rp0,
          keadaan kosong yang jujur) + 2 baris pipeline + tombol batch. */}
      <div className="relative flex aspect-[9/16] h-[78%] flex-col gap-2 rounded-2xl border border-gold/40 bg-panel p-3 shadow-2xl shadow-emerald-500/10">
        <span className="flex items-center gap-1.5 rounded-lg bg-ink px-2 py-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-gold" />
          <span className="h-1.5 w-16 rounded bg-fog/70" />
          <span className="ml-auto h-1.5 w-6 rounded bg-emerald-400/70" />
        </span>
        <span className="grid grid-cols-2 gap-1.5">
          {[
            { value: "0", label: "Produk terdata", tone: "text-fog" },
            { value: "0", label: "Draft naskah", tone: "text-fog" },
            { value: "0", label: "Antrean aktif", tone: "text-fog" },
            { value: "Rp0", label: "Komisi bulan ini", tone: "text-gold" },
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
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            <span className="h-1.5 flex-1 rounded bg-mist/40" />
            <span className="text-[7px] font-medium text-emerald-300">Jalan</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-ink px-2 py-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
            <span className="h-1.5 flex-1 rounded bg-mist/40" />
            <span className="text-[7px] font-medium text-amber-300">Belum</span>
          </span>
        </span>
        <span className="mt-auto flex h-6 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-gold-ink">
          Trigger Content Batch
        </span>
      </div>
      <span className="absolute left-[16%] top-[18%] flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold bg-gold/20 text-lg font-bold text-gold">
        Rp
      </span>
      <span className="absolute bottom-[20%] right-[14%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/20 text-xs font-bold text-emerald-300">
        Rp
      </span>
    </div>
  );
}

export default function Hero3D() {
  const reduceMotion = useReducedMotion();
  return (
    <div
      role="img"
      aria-label="Ponsel vertikal 9:16 mengambang menampilkan mock Command Center NexCreator — statistik, pipeline, dan tombol batch — dikelilingi koin komisi emas dan cincin emerald"
      className="h-full w-full"
    >
      {reduceMotion ? (
        <StaticHero />
      ) : (
        <Canvas
          camera={{ position: [0, 0, 8.5], fov: 40 }}
          dpr={[1, 1.75]}
          frameloop="demand"
        >
          <FrameDriver />
          <Scene />
        </Canvas>
      )}
    </div>
  );
}
