import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   BUTTERMAX-STYLE LIQUID PAINT REVEAL + MAGNETIC TYPOGRAPHY
   ═══════════════════════════════════════════════════════════════ */

interface BrushPoint {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  seed: number;
}

/* ═══════════════════════════════════════════════════════════════
   BRUSH MASK HOOK — smaller footprint, quadratic strokes, fast decay
   ═══════════════════════════════════════════════════════════════ */
function useBrushMask(
  containerRef: React.RefObject<HTMLElement | null>,
  invertedLayerRef: React.RefObject<HTMLDivElement | null>
) {
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<BrushPoint[]>([]);
  const lastMouseRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const syncSize = useCallback(() => {
    const canvas = maskCanvasRef.current;
    const blurCanvas = blurCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !blurCanvas || !container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(10, Math.round(rect.width));
    const h = Math.max(10, Math.round(rect.height));

    canvas.width = w;
    canvas.height = h;
    blurCanvas.width = w;
    blurCanvas.height = h;
    sizeRef.current = { w, h };
  }, [containerRef]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const blurCanvas = document.createElement("canvas");
    maskCanvasRef.current = canvas;
    blurCanvasRef.current = blurCanvas;
    syncSize();

    const container = containerRef.current;
    if (!container) return;

    window.addEventListener("resize", syncSize);

    const render = () => {
      const ctx = canvas.getContext("2d");
      const invertedLayer = invertedLayerRef.current;
      const { w, h } = sizeRef.current;

      if (!ctx || !invertedLayer || w === 0 || h === 0) {
        isRunningRef.current = false;
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const points = pointsRef.current;
      let hasVisible = false;

      if (points.length > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";

        /* ── PASS 1: Quadratic curved stroke path for smooth liquid ribbon ── */
        if (points.length >= 3) {
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.globalAlpha = 0.85;

          // Walk through points, drawing quadratic curves using midpoints
          for (let i = 1; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            if (!p0 || !p1) continue;
            if (p0.alpha <= 0.02 || p1.alpha <= 0.02) continue;

            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;

            // Average radius & alpha across segment
            const avgRadius = (p0.radius + p1.radius) / 2;
            const avgAlpha = (p0.alpha + p1.alpha) / 2;

            ctx.globalAlpha = avgAlpha * 0.9;
            ctx.lineWidth = avgRadius * 1.4;

            ctx.beginPath();
            const prev = points[i - 1];
            if (!prev) continue;
            const prevMidX = (prev.x + p0.x) / 2;
            const prevMidY = (prev.y + p0.y) / 2;
            ctx.moveTo(prevMidX, prevMidY);
            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
            ctx.stroke();
          }
        }

        /* ── PASS 2: Individual blobs for organic core ── */
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (!p) continue;
          if (p.alpha <= 0.02) continue;
          if (p.radius <= 1) continue;

          hasVisible = true;
          ctx.globalAlpha = p.alpha;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // 4 sub-blobs per point for irregular silhouette
          for (let k = 0; k < 4; k++) {
            const r1 = Math.sin(p.seed + k * 1.7891) * 0.5 + 0.5;
            const r2 = Math.cos(p.seed * 1.31 + k * 2.9714) * 0.5 + 0.5;

            const angle = (k / 4) * Math.PI * 2 + r1 * 0.9;
            const dist = p.radius * (0.35 + r2 * 0.35);
            const sx = p.x + Math.cos(angle) * dist;
            const sy = p.y + Math.sin(angle) * dist;
            const sr = p.radius * (0.35 + r1 * 0.25);

            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.globalAlpha = 1;

        /* ── PASS 3: Gooey post-process — blur + alpha stack ── */
        const blurCtx = blurCanvas.getContext("2d");
        if (blurCtx) {
          blurCtx.clearRect(0, 0, w, h);
          blurCtx.filter = "blur(10px)";
          blurCtx.drawImage(canvas, 0, 0);
          blurCtx.filter = "none";

          ctx.clearRect(0, 0, w, h);
          ctx.globalCompositeOperation = "source-over";
          for (let i = 0; i < 4; i++) {
            ctx.drawImage(blurCanvas, 0, 0);
          }
        }

        /* ── PASS 4: Fast exponential decay ── */
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (!p) continue;
          p.radius *= 0.93;
          p.alpha *= 0.9;
        }

        pointsRef.current = points.filter(
          (p) => p && p.alpha > 0.03 && p.radius > 1
        );
      }

      if (hasVisible) {
        const url = canvas.toDataURL("image/png");
        invertedLayer.style.webkitMaskImage = `url(${url})`;
        invertedLayer.style.maskImage = `url(${url})`;
        invertedLayer.style.opacity = "1";
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        invertedLayer.style.opacity = "0";
        invertedLayer.style.webkitMaskImage = "none";
        invertedLayer.style.maskImage = "none";
        isRunningRef.current = false;
      }
    };

    const startLoop = () => {
      if (!isRunningRef.current) {
        isRunningRef.current = true;
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();

      const last = lastMouseRef.current;

      // Smaller brush — 60–80px depending on viewport
      const baseRadius = Math.max(
        55,
        Math.min(80, window.innerHeight * 0.08)
      );

      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);

        // Spacing between stamps — tight for smooth ribbon
        const step = Math.max(4, baseRadius * 0.18);
        const steps = Math.max(1, Math.ceil(dist / step));

        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          pointsRef.current.push({
            x: last.x + dx * t,
            y: last.y + dy * t,
            radius: baseRadius,
            alpha: 1,
            seed: Math.random() * 1000,
          });
        }
      } else {
        pointsRef.current.push({
          x,
          y,
          radius: baseRadius,
          alpha: 1,
          seed: Math.random() * 1000,
        });
      }

      lastMouseRef.current = { x, y, time: now };

      if (pointsRef.current.length > 600) {
        pointsRef.current = pointsRef.current.slice(-600);
      }

      startLoop();
    };

    const handlePointerLeave = () => {
      lastMouseRef.current = null;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("resize", syncSize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      isRunningRef.current = false;
    };
  }, [containerRef, invertedLayerRef, syncSize]);
}

/* ═══════════════════════════════════════════════════════════════
   MAGNETIC HEADLINE — 3D tilt follows cursor
   ═══════════════════════════════════════════════════════════════ */
function MagneticHeadline({ inverted = false }: { inverted?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = wrapperRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = (e.clientX - cx) / (rect.width / 2); // -1..1
      const dy = (e.clientY - cy) / (rect.height / 2);

      // Cap influence — nearer = stronger
      const dist = Math.hypot(dx, dy);
      const influence = Math.max(0, 1 - dist * 0.6);

      // rotateY responds to horizontal, rotateX to vertical (inverted)
      const rotY = dx * influence * 6;   // max ~6deg
      const rotX = -dy * influence * 6;

      setTilt({ x: rotX, y: rotY });
    };

    const onLeave = () => setTilt({ x: 0, y: 0 });

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{ perspective: "1200px", perspectiveOrigin: "center center" }}
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: 1 + Math.min(Math.abs(tilt.x) + Math.abs(tilt.y), 6) * 0.003,
        }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 22,
          mass: 0.6,
        }}
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <HeadlineContent inverted={inverted} />
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED CONTENT — used in both layers
   ═══════════════════════════════════════════════════════════════ */
function HeadlineContent({ inverted = false }: { inverted?: boolean }) {
  return (
    <h2
      style={{
        fontFamily: '"Anton", sans-serif',
        lineHeight: 0.94,
        letterSpacing: "-0.015em",
        color: inverted ? "#FFFFFF" : "#0B0B0C",
      }}
      className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-normal uppercase max-w-2xl lg:max-w-3xl"
    >
      SOFTWARE STUDIO FOR <br className="hidden sm:inline" />
      FOUNDERS WHO SHIP
    </h2>
  );
}

function AboutContent({
  inverted,
  magnetic,
}: {
  inverted: boolean;
  magnetic?: boolean;
}) {
  const textColor = inverted ? "#FFFFFF" : "#0B0B0C";
  const bodyColor = inverted ? "rgba(255,255,255,0.85)" : "#052E16";
  const badgeTextColor = inverted ? "#FFFFFF" : "#0B0B0C";
  const badgeBg = inverted
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(11, 11, 12, 0.06)";
  const badgeBorder = inverted
    ? "rgba(255, 255, 255, 0.15)"
    : "rgba(11, 11, 12, 0.12)";

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-14 lg:px-20 py-24 md:py-28 flex flex-col justify-center min-h-screen">
      <div className="max-w-3xl ml-0 md:ml-12 lg:ml-20">
        {/* Glassmorphic Badge / Overline */}
        <div
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            color: badgeTextColor,
            background: badgeBg,
            border: `1px solid ${badgeBorder}`,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            padding: "6px 14px",
            borderRadius: "9999px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "1.25rem",
            width: "fit-content",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: inverted ? "#D2FF00" : "#0B0B0C",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: badgeTextColor,
            }}
          >
            ABOUT ALTIMA
          </span>
        </div>

        {magnetic ? (
          <MagneticHeadline inverted={inverted} />
        ) : (
          <div style={{ color: textColor }}>
            <HeadlineContent inverted={inverted} />
          </div>
        )}

        <p
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            color: bodyColor,
            fontWeight: 500,
          }}
          className="mt-6 md:mt-8 text-base sm:text-lg md:text-xl font-normal max-w-xl leading-relaxed"
        >
          We partner with ambitious early-stage founders to design, engineer, and
          ship bold digital products that define their categories.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN ABOUT COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function About() {
  const brushContainerRef = useRef<HTMLDivElement>(null);
  const invertedLayerRef = useRef<HTMLDivElement>(null);

  useBrushMask(brushContainerRef, invertedLayerRef);

  return (
    <section
      id="about"
      data-nav-theme="lime"
      className="relative min-h-screen w-full select-none overflow-hidden"
      style={{ backgroundColor: "#D2FF00", color: "#0B0B0C" }}
    >
      {/* ── Inline SVG gooey filter (reference) ── */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
      >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* ═════════════════════════════════════════════════════
          DUAL-LAYER BRUSH REVEAL SYSTEM
          ═════════════════════════════════════════════════════ */}
      <div
        ref={brushContainerRef}
        className="relative min-h-screen w-full"
        style={{ zIndex: 5, cursor: "crosshair" }}
      >
        {/* ── BASE LAYER: Yellow + Black text (with magnetic headline) ── */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <AboutContent inverted={false} magnetic={true} />
        </div>

        {/* ── INVERTED LAYER: Pure black + White text — masked ── */}
        <div
          ref={invertedLayerRef}
          className="absolute inset-0"
          style={{
            zIndex: 2,
            backgroundColor: "#000000",
            opacity: 0,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            pointerEvents: "none",
            willChange: "mask-image, -webkit-mask-image, opacity",
          }}
        >
          <AboutContent inverted={true} magnetic={false} />
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════
          FLOATING 3D ASSETS — untouched
          ═════════════════════════════════════════════════════ */}

      {/* ── 1. Top-Left: ALTIMA CHIP ── */}
      <motion.div
        className="absolute pointer-events-none select-none"
        style={{
          top: "22%",
          left: "clamp(1rem, 3.5vw, 5rem)",
          width: "clamp(120px, 14vw, 210px)",
          zIndex: 15,
        }}
        initial={{ opacity: 0, scale: 0.85, x: -20 }}
        whileInView={{ opacity: 1, scale: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={{ y: [-6, 6, -6], rotate: [-1, 1.5, -1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="/about-us-img/altima_chip.webp"
            alt="Altima Chip"
            className="w-full h-auto object-contain"
            style={{
              filter:
                "drop-shadow(0 25px 35px rgba(0, 0, 0, 0.45)) drop-shadow(0 10px 15px rgba(0, 0, 0, 0.3))",
            }}
          />
        </motion.div>
      </motion.div>

      {/* ── 2. Top-Right: GLASS MONITOR ── */}
      <motion.div
        className="absolute pointer-events-none select-none hidden sm:block"
        style={{
          top: "clamp(2rem, 5vh, 6rem)",
          right: "clamp(2rem, 8vw, 13rem)",
          width: "clamp(260px, 29vw, 440px)",
          zIndex: 15,
        }}
        initial={{ opacity: 0, scale: 0.9, y: -30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={{ y: [6, -6, 6], rotate: [0.5, -1, 0.5] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="/about-us-img/glass_monitor.webp"
            alt="Glass Monitor"
            className="w-full h-auto object-contain"
            style={{
              filter:
                "drop-shadow(0 30px 45px rgba(0, 0, 0, 0.38)) drop-shadow(0 12px 20px rgba(0, 0, 0, 0.25))",
            }}
          />
        </motion.div>
      </motion.div>

      {/* ── 3. Bottom-Right: GLASS TERMINAL ── */}
      <motion.div
        className="absolute pointer-events-none select-none hidden md:block"
        style={{
          bottom: "clamp(2rem, 7vh, 6rem)",
          right: "clamp(2rem, 6vw, 9rem)",
          width: "clamp(240px, 26vw, 400px)",
          zIndex: 15,
        }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={{ y: [-5, 5, -5], rotate: [-0.5, 0.5, -0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <img
            src="/about-us-img/glass_terminal.webp"
            alt="Glass Terminal"
            className="w-full h-auto object-contain"
            style={{
              filter:
                "drop-shadow(0 25px 35px rgba(0, 0, 0, 0.35)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25))",
            }}
          />
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-3 bg-black/25 blur-md rounded-full pointer-events-none"
            aria-hidden="true"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}