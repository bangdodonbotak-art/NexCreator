"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Indikator progres scroll — garis emas di atas halaman landing. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-[#10B981] via-[#C9A227] to-[#10B981]"
    />
  );
}
