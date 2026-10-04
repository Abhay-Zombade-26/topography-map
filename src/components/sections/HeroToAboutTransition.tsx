import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   HERO → ABOUT  OBYS-STYLE HYPNOTIC DONUT EXPANSION
   
   Architecture:
   - Sits BETWEEN Hero and About in the page flow.
   - Solid black (#000) canvas, GSAP ScrollTrigger pinned.
   - Lime ball enters from top (visually continues from Hero's
     exiting orbit dot), scales → donut → concentric ripple
     → fills viewport with #D2FF00 revealing About content
     underneath via radial clip-path.
   - ZERO glow / blur / drop-shadow on any element.
   ═══════════════════════════════════════════════════════════════ */

export default function HeroToAboutTransition() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const donutRef = useRef<HTMLDivElement>(null);
  const cutoutRef = useRef<HTMLDivElement>(null);
  const innerDotRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const limeFillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const ball = ballRef.current;
    const donut = donutRef.current;
    const cutout = cutoutRef.current;
    const innerDot = innerDotRef.current;
    const ring1 = ring1Ref.current;
    const ring2 = ring2Ref.current;
    const limeFill = limeFillRef.current;

    if (!wrapper || !ball || !donut || !cutout || !innerDot || !ring1 || !ring2 || !limeFill) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsap.set(limeFill, { clipPath: "none" });
      return;
    }

    const ctx = gsap.context(() => {
      /* ── Initial state ── */
      gsap.set(ball, { y: "-42vh", scale: 1, opacity: 1 });
      gsap.set(donut, { scale: 0, opacity: 0 });
      gsap.set(cutout, { scale: 0, opacity: 0 });
      gsap.set(innerDot, { scale: 0, opacity: 0 });
      gsap.set([ring1, ring2], { scale: 0.3, opacity: 0 });
      gsap.set(limeFill, { clipPath: "circle(0% at 50% 50%)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "+=1200",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      /* ─────────────────────────────────────────────────────
         PHASE 1 (0 → 0.30): Ball drops from top of black
         canvas to dead center. Continuous, never disappears.
         ───────────────────────────────────────────────────── */
      tl.to(
        ball,
        {
          y: 0,
          ease: "power2.out",
          duration: 0.30,
        },
        0
      );

      /* ─────────────────────────────────────────────────────
         PHASE 2 (0.30 → 0.50): Ball scales up into a large
         solid lime circle at center of black canvas.
         ───────────────────────────────────────────────────── */
      tl.to(
        ball,
        {
          scale: 8,
          ease: "power1.inOut",
          duration: 0.20,
        },
        0.30
      );

      /* ─────────────────────────────────────────────────────
         PHASE 3 (0.50 → 0.70): Donut formation.
         - Ball continues expanding (becomes outer ring boundary)
         - Black cutout circle opens inside → donut ring
         - Secondary lime dot emerges at center
         ───────────────────────────────────────────────────── */
      // Ball expands further to form outer donut boundary
      tl.to(
        ball,
        {
          scale: 14,
          ease: "power1.inOut",
          duration: 0.20,
        },
        0.50
      );

      // Donut ring becomes visible (alternative visual layer)
      tl.fromTo(
        donut,
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, ease: "power1.inOut", duration: 0.15 },
        0.50
      );

      // Black cutout opens inside the lime circle
      tl.fromTo(
        cutout,
        { scale: 0, opacity: 1 },
        { scale: 1, ease: "power1.inOut", duration: 0.18 },
        0.52
      );

      // Secondary lime center dot emerges
      tl.fromTo(
        innerDot,
        { scale: 0, opacity: 1 },
        { scale: 1, ease: "back.out(1.4)", duration: 0.14 },
        0.56
      );

      /* ─────────────────────────────────────────────────────
         PHASE 4 (0.70 → 0.85): Hypnotic outward expansion.
         Everything scales exponentially outward in a smooth
         ripple effect — outer ring, inner dot, concentric rings.
         ───────────────────────────────────────────────────── */
      // Ball (outer ring) blows up massively
      tl.to(
        ball,
        {
          scale: 80,
          ease: "power2.in",
          duration: 0.15,
        },
        0.70
      );

      // Donut ring expands
      tl.to(
        donut,
        {
          scale: 50,
          ease: "power2.in",
          duration: 0.15,
        },
        0.70
      );

      // Inner dot expands outward
      tl.to(
        innerDot,
        {
          scale: 60,
          ease: "power2.in",
          duration: 0.15,
        },
        0.70
      );

      // Cutout fades as everything scales past it
      tl.to(
        cutout,
        {
          opacity: 0,
          duration: 0.06,
        },
        0.72
      );

      // Concentric ripple rings burst outward
      tl.fromTo(
        ring1,
        { scale: 0.3, opacity: 1 },
        { scale: 40, opacity: 0.8, ease: "power2.in", duration: 0.15 },
        0.70
      );
      tl.fromTo(
        ring2,
        { scale: 0.3, opacity: 1 },
        { scale: 30, opacity: 0.7, ease: "power2.in", duration: 0.15 },
        0.73
      );

      /* ─────────────────────────────────────────────────────
         PHASE 5 (0.70 → 1.00): Reveal About section.
         Expanding radial clip-path uncovers the lime #D2FF00
         About layer underneath. Rings fade out.
         ───────────────────────────────────────────────────── */
      tl.to(
        limeFill,
        {
          clipPath: "circle(160% at 50% 50%)",
          ease: "power2.out",
          duration: 0.30,
        },
        0.70
      );

      // Fade all donut elements as the About layer takes over
      tl.to(
        [ball, donut, innerDot, ring1, ring2],
        {
          opacity: 0,
          duration: 0.08,
        },
        0.92
      );
    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#000000",
        zIndex: 1,
      }}
    >
      {/* ── Donut Animation Elements (on black canvas) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {/* Concentric Ripple Ring 2 */}
        <div
          ref={ring2Ref}
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            border: "5px solid #D2FF00",
            backgroundColor: "transparent",
            willChange: "transform, opacity",
          }}
        />

        {/* Concentric Ripple Ring 1 */}
        <div
          ref={ring1Ref}
          style={{
            position: "absolute",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            border: "7px solid #D2FF00",
            backgroundColor: "transparent",
            willChange: "transform, opacity",
          }}
        />

        {/* The Continuous Lime Ball — scales to become outer donut ring */}
        <div
          ref={ballRef}
          style={{
            position: "absolute",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "#D2FF00",
            willChange: "transform",
          }}
        />

        {/* Donut ring visual (lime border, transparent center) */}
        <div
          ref={donutRef}
          style={{
            position: "absolute",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            border: "28px solid #D2FF00",
            backgroundColor: "transparent",
            willChange: "transform, opacity",
          }}
        />

        {/* Black inner cutout (forms donut hole on black canvas) */}
        <div
          ref={cutoutRef}
          style={{
            position: "absolute",
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            backgroundColor: "#000000",
            willChange: "transform, opacity",
          }}
        />

        {/* Secondary lime center dot */}
        <div
          ref={innerDotRef}
          style={{
            position: "absolute",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#D2FF00",
            willChange: "transform, opacity",
          }}
        />
      </div>

      {/* ── About Section Reveal Layer (lime fill → content) ── */}
      <div
        ref={limeFillRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#D2FF00",
          clipPath: "circle(0% at 50% 50%)",
          willChange: "clip-path",
          zIndex: 5,
        }}
      />
    </div>
  );
}
