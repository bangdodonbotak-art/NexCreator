"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Count-up untuk angka NYATA saja (DesignSpells / Dub.co pattern).
 * Dipakai di section Target: target Rp5.000.000 (GOAL) menghitung naik
 * saat masuk viewport. Progres 0% dan Rp0 tercatat TIDAK dianimasikan
 * jadi angka lain — kejujuran angka dipertahankan.
 * State awal = nilai akhir, jadi SSR / tanpa JS / sebelum masuk viewport
 * angkanya tetap benar; animasi 0→target hanya jalan saat inView + JS aktif.
 * Bila prefers-reduced-motion, langsung tampil angka akhir.
 */
export default function CountUp({
  to,
  prefix = "",
  className,
}: {
  to: number;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!inView) {
      setValue(0);
      return;
    }
    if (reduceMotion) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, to]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {new Intl.NumberFormat("id-ID").format(value)}
    </span>
  );
}
