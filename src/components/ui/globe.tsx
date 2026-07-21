"use client";

import createGlobe from "cobe";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

// A slow-spinning globe in the site's palette: a navy sphere with matte
// gold marks over the world's financial centers. Rebuilt from a cyan
// "cobe" demo to match the gold ledger system, so it reads as native. It
// is theme-aware (re-tints for light and dark), draggable, and holds
// still under prefers-reduced-motion. The provided demo's pulse overlays
// used CSS anchor positioning, which Safari and Firefox do not support,
// so this uses the globe's own markers instead.

// Major market cities: London, New York, Tokyo, Hong Kong, Frankfurt,
// Sydney, Sao Paulo.
const MARKERS: { location: [number, number]; size: number }[] = [
  { location: [51.51, -0.13], size: 0.06 },
  { location: [40.71, -74.01], size: 0.07 },
  { location: [35.68, 139.65], size: 0.06 },
  { location: [22.32, 114.17], size: 0.05 },
  { location: [50.11, 8.68], size: 0.045 },
  { location: [-33.87, 151.21], size: 0.045 },
  { location: [-23.55, -46.63], size: 0.045 },
];

// COBE takes linear RGB in 0..1. Gold marks stay constant; the sphere and
// glow shift so the globe sits on cream in light mode and navy in dark.
const GOLD: [number, number, number] = [0.83, 0.67, 0.28];
const THEME = {
  light: {
    base: [0.21, 0.29, 0.44] as [number, number, number],
    glow: [0.92, 0.9, 0.84] as [number, number, number],
    brightness: 9,
    baseBrightness: 0.22,
  },
  dark: {
    base: [0.13, 0.2, 0.33] as [number, number, number],
    glow: [0.05, 0.1, 0.19] as [number, number, number],
    brightness: 6,
    baseBrightness: 0.05,
  },
};

// The globe re-tints on theme change and holds still under reduced motion.
// Both are external browser state, so useSyncExternalStore reads them
// without a setState-in-effect and stays clean through hydration.
const subscribeTheme = (cb: () => void) => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => obs.disconnect();
};
const getThemeSnapshot = () =>
  document.documentElement.classList.contains("dark");

const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getMotionSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Globe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const dragRef = useRef(0);
  const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => true);
  const reduceMotion = useSyncExternalStore(
    subscribeMotion,
    getMotionSnapshot,
    () => false
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = e.clientX - dragRef.current;
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragRef.current = e.clientX - pointerInteracting.current;
      }
    };
    const onUp = () => {
      pointerInteracting.current = null;
      if (canvasRef.current) canvasRef.current.style.cursor = "grab";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    let globe: ReturnType<typeof createGlobe> | null = null;
    let raf = 0;
    const theme = dark ? THEME.dark : THEME.light;

    const onResize = () => {
      if (canvas.offsetWidth > 0) widthRef.current = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);

    const build = () => {
      widthRef.current = canvas.offsetWidth;
      if (widthRef.current === 0 || globe) return;
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: widthRef.current * 2,
        height: widthRef.current * 2,
        phi: 0,
        theta: 0.25,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: theme.brightness,
        mapBaseBrightness: theme.baseBrightness,
        baseColor: theme.base,
        markerColor: GOLD,
        glowColor: theme.glow,
        markers: MARKERS,
      });
      const animate = () => {
        if (pointerInteracting.current === null && !reduceMotion) {
          phiRef.current += 0.004;
        }
        globe!.update({
          phi: phiRef.current + dragRef.current / 200,
          theta: 0.25,
          width: widthRef.current * 2,
          height: widthRef.current * 2,
        });
        raf = requestAnimationFrame(animate);
      };
      animate();
      requestAnimationFrame(() => {
        if (canvas) canvas.style.opacity = "1";
      });
    };

    // Build now if the canvas already has a size, else wait for layout.
    let ro: ResizeObserver | null = null;
    if (canvas.offsetWidth > 0) {
      build();
    } else {
      ro = new ResizeObserver((entries) => {
        if ((entries[0]?.contentRect.width ?? 0) > 0) {
          ro?.disconnect();
          build();
        }
      });
      ro.observe(canvas);
    }

    return () => {
      cancelAnimationFrame(raf);
      globe?.destroy();
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dark, reduceMotion]);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        aria-hidden
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          contain: "layout paint size",
          touchAction: "none",
        }}
      />
    </div>
  );
}
