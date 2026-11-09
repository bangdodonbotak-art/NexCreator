"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * Smooth scrolling (Lenis) untuk landing page. Dilewati bila
 * prefers-reduced-motion (anchor kembali ke lompatan native instan).
 * Anchor nav (#alur / #modul / #fase / #masalah) dicegat dan
 * di-scroll via lenis.scrollTo — CSS scroll-behavior: smooth sengaja
 * dihapus dari globals.css supaya tidak bentrok dengan Lenis.
 */
export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
