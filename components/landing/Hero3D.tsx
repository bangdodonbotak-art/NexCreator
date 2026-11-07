"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import type { Group } from "three";

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
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.09]}>
        <torusGeometry args={[0.72, 0.045, 16, 64]} />
        <meshStandardMaterial color="#f5d76e" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.09]}>
        <torusGeometry args={[0.72, 0.045, 16, 64]} />
        <meshStandardMaterial color="#f5d76e" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Bingkai ponsel 9:16 dengan layar emerald + garis caption emas. */
function Phone() {
  return (
    <group>
      {/* bodi */}
      <mesh>
        <boxGeometry args={[1.95, 3.45, 0.14]} />
        <meshStandardMaterial color="#0e1524" metalness={0.4} roughness={0.35} />
      </mesh>
      {/* layar */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[1.75, 3.25]} />
        <meshStandardMaterial
          color="#0b2e22"
          emissive="#10b981"
          emissiveIntensity={0.35}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      {/* garis caption di layar */}
      {[-0.9, -0.55, -0.2].map((y, i) => (
        <mesh key={i} position={[-0.15 + i * 0.08, y, 0.1]}>
          <planeGeometry args={[1.15 - i * 0.25, 0.09]} />
          <meshStandardMaterial
            color="#c9a227"
            emissive="#c9a227"
            emissiveIntensity={0.9}
          />
        </mesh>
      ))}
      {/* tombol play di tengah layar */}
      <mesh position={[0, 0.55, 0.1]}>
        <circleGeometry args={[0.28, 32]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.8}
        />
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
      <pointLight position={[-5, -2, 3]} intensity={12} color="#10b981" />
      <pointLight position={[4, -3, 2]} intensity={10} color="#c9a227" />

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
            <meshStandardMaterial color="#10b981" metalness={0.7} roughness={0.3} />
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
              color={i % 2 === 0 ? "#c9a227" : "#34d399"}
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
      <div className="relative flex aspect-[9/16] h-[78%] flex-col justify-between rounded-2xl border border-[#C9A227]/40 bg-[#0E1524] p-4 shadow-2xl shadow-emerald-500/10">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/90">
          <span className="ml-1 h-0 w-0 border-y-8 border-l-[14px] border-y-transparent border-l-[#04150D]" />
        </span>
        <span className="space-y-2">
          <span className="block h-2 w-4/5 rounded bg-[#C9A227]/80" />
          <span className="block h-2 w-3/5 rounded bg-[#C9A227]/60" />
          <span className="block h-2 w-2/3 rounded bg-[#C9A227]/40" />
        </span>
      </div>
      <span className="absolute left-[16%] top-[18%] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C9A227] bg-[#C9A227]/20 text-lg font-bold text-[#C9A227]">
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
      aria-label="Ponsel vertikal 9:16 mengambang dikelilingi koin komisi emas dan cincin emerald — ilustrasi studio kreator virtual NexCreator"
      className="h-full w-full"
    >
      {reduceMotion ? (
        <StaticHero />
      ) : (
        <Canvas camera={{ position: [0, 0, 8.5], fov: 40 }} dpr={[1, 1.75]}>
          <Scene />
        </Canvas>
      )}
    </div>
  );
}
