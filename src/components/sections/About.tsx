import { useRef, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   BUTTERMAX-STYLE LIQUID PAINT REVEAL
   ═══════════════════════════════════════════════════════════════
   Base Layer (bottom):  Yellow #D2FF00 bg + BLACK text  ← always visible
   Inverted Layer (top): Pure black #000000 bg + WHITE text  ← revealed by brush
   Mask Canvas:          Liquid blobs merged via gooey post-process,
                         used as CSS mask-image on the inverted layer.
                         Exponential decay → strokes dissolve like surface tension.
   ═══════════════════════════════════════════════════════════════ */

interface BrushPoint {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  seed: number;
  vx: number; // velocity for stretch
  vy: number;
}

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

      /* ── STEP 1: Clear main canvas ── */
      ctx.clearRect(0, 0, w, h);

      const points = pointsRef.current;
      let hasVisible = false;

      if (points.length > 0) {
        /* ── STEP 2: Draw each point as a solid white blob + sub-blobs ── */
        ctx.fillStyle = "#ffffff";

        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (!p) continue;
          if (p.alpha <= 0.01) continue;
          if (p.radius <= 1) continue;

          hasVisible = true;
          ctx.globalAlpha = p.alpha;

          // ── Main circular blob ──
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // ── Organic sub-blobs (deterministic from seed) ──
          // These give the blob an irregular liquid silhouette.
          for (let k = 0; k < 6; k++) {
            const r1 = Math.sin(p.seed + k * 1.7891) * 0.5 + 0.5;
            const r2 = Math.cos(p.seed * 1.31 + k * 2.9714) * 0.5 + 0.5;
            const r3 = Math.sin(p.seed * 0.77 + k * 3.14159) * 0.5 + 0.5;

            const angle = (k / 6) * Math.PI * 2 + r1 * 0.8;
            const dist = p.radius * (0.3 + r2 * 0.42);
            const sx = p.x + Math.cos(angle) * dist;
            const sy = p.y + Math.sin(angle) * dist;
            const sr = p.radius * (0.32 + r3 * 0.32);

            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.globalAlpha = 1;

        /* ── STEP 3: Gooey post-process (blur + alpha stack) ── */
        // Blur the whole canvas into blurCanvas
        const blurCtx = blurCanvas.getContext("2d");
        if (blurCtx) {
          blurCtx.clearRect(0, 0, w, h);
          // SVG-style gooey: blur brings nearby blobs together
          blurCtx.filter = "blur(14px)";
          blurCtx.drawImage(canvas, 0, 0);
          blurCtx.filter = "none";

          // Now stack the blurred version onto the main canvas N times.
          // This multiplicatively boosts alpha in the core of each blob
          // while keeping edges soft — approximating the feColorMatrix
          // threshold used by the classic SVG gooey filter.
          ctx.clearRect(0, 0, w, h);
          ctx.globalCompositeOperation = "source-over";
          for (let i = 0; i < 5; i++) {
            ctx.drawImage(blurCanvas, 0, 0);
          }
          ctx.globalCompositeOperation = "source-over";
        }

        /* ── STEP 4: Exponential ease-out decay ── */
        // radius and alpha decay multiplicatively — like surface tension
        // pulling liquid back into itself.
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (!p) continue;
          p.radius *= 0.94;
          p.alpha *= 0.92;
        }

        pointsRef.current = points.filter(
          (p) => p && p.alpha > 0.02 && p.radius > 1.5
        );
      }

      /* ── STEP 5: Update mask or clear ── */
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

      // Base brush radius — large pooled droplet
      const baseRadius = Math.max(
        120,
        Math.min(180, window.innerHeight * 0.16)
      );

      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const dt = Math.max(now - last.time, 8);
        const speed = dist / dt; // px/ms

        // ── Velocity-based scaling ──
        // Fast movement → smaller, stretched strokes (thinner ink trail)
        // Slow movement → bigger, rounded pool (surface tension pools)
        const speedFactor = Math.min(speed * 0.05, 1); // 0..1
        const radius = baseRadius * (1 - speedFactor * 0.35); // 65%–100%

        // Tight spacing so fast strokes stay connected (stretched)
        const step = Math.max(6, radius * (0.14 + speedFactor * 0.1));
        const steps = Math.max(1, Math.ceil(dist / step));

        // Normalized velocity for potential stretch
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          pointsRef.current.push({
            x: last.x + dx * t,
            y: last.y + dy * t,
            radius,
            alpha: 1,
            seed: Math.random() * 1000,
            vx: nx * speed,
            vy: ny * speed,
          });
        }
      } else {
        pointsRef.current.push({
          x,
          y,
          radius: baseRadius,
          alpha: 1,
          seed: Math.random() * 1000,
          vx: 0,
          vy: 0,
        });
      }

      lastMouseRef.current = { x, y, time: now };

      // Safety cap
      if (pointsRef.current.length > 500) {
        pointsRef.current = pointsRef.current.slice(-500);
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
   SHARED CONTENT
   ═══════════════════════════════════════════════════════════════ */
function AboutContent({ inverted }: { inverted: boolean }) {
  const textColor = inverted ? "#FFFFFF" : "#111112";
  const textColorFaded = inverted ? "rgba(255,255,255,0.85)" : "rgba(17,17,18,0.85)";
  const overlineColor = inverted ? "rgba(255,255,255,0.7)" : "rgba(17,17,18,0.8)";

  return (
    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-14 lg:px-20 py-24 md:py-28 flex flex-col justify-center min-h-screen">
      <div className="max-w-3xl ml-0 md:ml-12 lg:ml-20">
        <div
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            color: overlineColor,
          }}
          className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] mb-4"
        >
          ABOUT ALTIMA
        </div>

        <h2
          style={{
            fontFamily: '"Anton", sans-serif',
            lineHeight: 0.94,
            letterSpacing: "-0.015em",
            color: textColor,
          }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-normal uppercase max-w-2xl lg:max-w-3xl"
        >
          SOFTWARE STUDIO FOR <br className="hidden sm:inline" />
          FOUNDERS WHO SHIP
        </h2>

        <p
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            color: textColorFaded,
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
  const sectionRef = useRef<HTMLElement>(null);
  const brushContainerRef = useRef<HTMLDivElement>(null);
  const invertedLayerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 30%"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.6,
  });

  const scaleY = useTransform(smooth, [0, 1], [0, 1]);

  useBrushMask(brushContainerRef, invertedLayerRef);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen w-full select-none overflow-hidden"
      style={{ backgroundColor: "#D2FF00", color: "#111112" }}
    >
      {/* ── Inline SVG gooey filter (available for reference / optional CSS use) ── */}
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

      {/* ── Scroll transition background wipe ── */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#D2FF00",
          transformOrigin: "center top",
          scaleY,
          zIndex: 0,
        }}
      />

      {/* ═════════════════════════════════════════════════════
          DUAL-LAYER BRUSH REVEAL SYSTEM
          ═════════════════════════════════════════════════════ */}
      <div
        ref={brushContainerRef}
        className="relative min-h-screen w-full"
        style={{ zIndex: 5, cursor: "crosshair" }}
      >
        {/* ── BASE LAYER: Yellow + Black text ── */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <AboutContent inverted={false} />
        </div>

        {/* ── INVERTED LAYER: Pure black + White text — masked by canvas ── */}
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
          <AboutContent inverted={true} />
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
            src="/about-us-img/altima_chip.png"
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
            src="/about-us-img/glass_monitor.png"
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
            src="/about-us-img/glass_terminal.png"
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