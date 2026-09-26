import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import Nav from "@/components/ui/Nav";
import ScrollWatch from "@/components/ui/ScrollWatch";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const BOUNCE_EASE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [cubeHovered, setCubeHovered] = useState(false);

  // ═══════════════════════════════════════════════════════
  // PRELOADER STATE: Center Clock Zoom-In to Zoom-Out
  // ═══════════════════════════════════════════════════════
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setLoadProgress(100);
      setIsLoaded(true);
      setHeroRevealed(true);
      return;
    }

    const start = performance.now();
    const duration = 1600; // smooth 1.6s counter

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      // Smooth cubic deceleration towards 100%
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.min(Math.floor(eased * 100), 100);
      setLoadProgress(val);

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setLoadProgress(100);
        // Brief 200ms hold at 100% completion before zoom-out
        setTimeout(() => {
          setIsLoaded(true);
          // Reveal surrounding hero elements once zoom-out settles
          setTimeout(() => {
            setHeroRevealed(true);
          }, 700);
        }, 200);
      }
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  // ═══════════════════════════════════════════════════════
  // SCROLL-TRIGGERED MECHANICS (PINNED CONTAINER, SCRUB: 1)
  // ═══════════════════════════════════════════════════════
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.6,
  });

  const TWO_OCLOCK = 60;   // 2 o'clock position (60°)
  const SIX_OCLOCK = 180;  // 6 o'clock position (180°, bottom center)

  // Rule 2 — Orbital Motion (2 o'clock to 6 o'clock):
  // Hand rotates counter-clockwise with dot from 2 o'clock to 6 o'clock
  const handRotation = useTransform(
    smooth,
    [0, 0.6, 1.0],
    [TWO_OCLOCK, SIX_OCLOCK, SIX_OCLOCK]
  );

  // Outer dial ticks rotate counter-clockwise
  const dialRotation = useTransform(
    smooth,
    [0, 0.6, 1.0],
    [0, -60, -60]
  );

  // Lime dot moves along perimeter path from 2 o'clock down to 6 o'clock
  const orbitAngle = useTransform(
    smooth,
    [0, 0.6, 1.0],
    [TWO_OCLOCK, SIX_OCLOCK, SIX_OCLOCK]
  );

  // Rule 1 — Zero Expansion in Hero:
  // Under NO circumstance should lime color expand over Hero layout.
  // Scale stays strictly 1 (18px dot) throughout the hero sequence.
  const orbitDotScale = useTransform(smooth, [0, 1.0], [1, 1]);

  // Rule 3 — Downward Exit & Section 2 Fill:
  // When dot reaches 6 o'clock (scroll 0.6), transition position downward
  // toward the bottom boundary of the hero section container.
  const orbitDotYOffset = useTransform(
    smooth,
    [0, 0.6, 0.88, 1.0],
    [0, 0, 240, 240]
  );

  // Dot gently fades as it exits into Section 2 at bottom boundary
  const orbitDotOpacity = useTransform(smooth, [0, 0.85, 0.95], [1, 1, 0]);

  // Subtle dial scale on scroll
  const dialScale = useTransform(smooth, [0, 0.6], [1, 1.05]);

  // "SCROLL TO EXPLORE" label fades out on scroll
  const labelOpacity = useTransform(smooth, [0, 0.08], [1, 0]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: "300vh" }}>
      {/* 
        Fixed Navbar (z-index: 9999, top: 0, width: 100%)
        Hidden during preloader, fades in once zoomed out,
        remains fixed across all sections.
      */}
      <Nav isVisible={heroRevealed} />

      <div
        className="sticky top-0 h-screen w-full overflow-hidden select-none"
        style={{
          backgroundColor: "#EFEBE0",
          backgroundImage: `radial-gradient(ellipse at center, transparent 50%, #E5DFD0 100%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.55 0 0 0 0 0.5 0 0 0 0 0.4 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          color: "#111112",
        }}
      >
        {/* FOR FOUNDERS WHO SHIP label */}
        <motion.div
          className="pointer-events-none absolute z-30 select-none uppercase"
          style={{
            top: "14%",
            left: "4rem",
            fontFamily: '"Anton", sans-serif',
            fontSize: "1.3rem",
            letterSpacing: "0.3em",
            color: "#111112",
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
        >
          FOR FOUNDERS WHO SHIP
        </motion.div>

        {/* ALTIMA wordmark — tilted, baseline hits ~52% */}
        <div
          className="pointer-events-none absolute z-30 select-none"
          style={{
            top: "18%",
            left: "4rem",
            right: "4rem",
            height: "34vh",
          }}
        >
          <motion.div
            style={{
              width: "100%",
              height: "100%",
              transform: "rotate(5deg)",
              transformOrigin: "left center",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1.0, ease: EASE }}
          >
            <svg
              viewBox="0 0 1000 200"
              preserveAspectRatio="none"
              style={{ width: "100%", height: "100%", display: "block" }}
              aria-label="ALTIMA"
            >
              <text
                x="0"
                y="180"
                fontFamily='"Anton", sans-serif'
                fontSize="200"
                fill="#111112"
                textLength="1000"
                lengthAdjust="spacingAndGlyphs"
              >
                ALTIMA
              </text>
            </svg>
          </motion.div>
        </div>

        {/* SOFTWARE SOLUTIONS — right side, overlapping ALTIMA's bottom-right */}
        <motion.div
          className="pointer-events-none absolute z-30 flex flex-col items-end text-right select-none"
          style={{
            top: "50%",
            right: "4rem",
            fontFamily: '"Anton", sans-serif',
            fontWeight: 400,
            fontSize: "6vw",
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            color: "#D2FF00",
            WebkitTextStroke: "1.5px #111112",
            paintOrder: "stroke fill",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
          initial={{ opacity: 0, y: 25 }}
          animate={heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        >
          <div>SOFTWARE</div>
          <div>SOLUTIONS</div>
        </motion.div>

        {/* MODERN WEBSITES label */}
        <motion.div
          className="pointer-events-none absolute z-30 select-none uppercase"
          style={{
            top: "53%",
            left: "5rem",
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: "0.8rem",
            letterSpacing: "0.2em",
            color: "#111112",
          }}
          initial={{ opacity: 0 }}
          animate={heroRevealed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
        >
          MODERN WEBSITES / WEB APPS / DIGITAL PRODUCTS
        </motion.div>

        {/* LET'S BUILD TOGETHER CTA */}
        <motion.div
          className="absolute z-30 select-none pointer-events-auto"
          style={{ bottom: "8%", left: "4rem" }}
          initial={{ opacity: 0, y: 15 }}
          animate={heroRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
        >
          <a
            href="/contact"
            className="group inline-flex flex-col items-start cursor-pointer no-underline"
          >
            <span
              style={{
                fontFamily: '"Anton", sans-serif',
                fontSize: "0.8rem",
                letterSpacing: "0.2em",
                color: "#111112",
              }}
              className="uppercase transition-opacity duration-200 group-hover:opacity-75"
            >
              LET&apos;S BUILD TOGETHER ↗
            </span>
            <div
              style={{
                width: "80px",
                height: "2px",
                backgroundColor: "#D2FF00",
                marginTop: "8px",
              }}
              className="transition-all duration-300 group-hover:w-[100px]"
            />
          </a>
        </motion.div>

        {/* 3D LIME CUBE — bottom-right corner */}
        <motion.div
          className="absolute z-30 pointer-events-auto"
          style={{ top: "78%", right: "6%" }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={heroRevealed ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: BOUNCE_EASE }}
        >
          <div
            className="relative cursor-pointer select-none"
            style={{
              width: "7vw",
              height: "7vw",
              minWidth: "85px",
              minHeight: "85px",
              maxWidth: "110px",
              maxHeight: "110px",
              perspective: "1200px",
            }}
            onMouseEnter={() => setCubeHovered(true)}
            onMouseLeave={() => setCubeHovered(false)}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                transformStyle: "preserve-3d",
                transform: cubeHovered
                  ? "rotateX(-20deg) rotateY(45deg)"
                  : "rotateX(-20deg) rotateY(-25deg)",
                transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#D2FF00",
                  transform: "translateZ(3.5vw)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#A8CC00",
                  transform: "rotateY(90deg) translateZ(3.5vw)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#E4FF7A",
                  transform: "rotateX(90deg) translateZ(3.5vw)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "-1vw",
                left: "50%",
                transform: "translateX(-50%)",
                width: "7vw",
                minWidth: "85px",
                height: "0.6vw",
                minHeight: "5px",
                background: "rgba(17, 17, 17, 0.15)",
                filter: "blur(10px)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
          </div>
        </motion.div>

        {/* 
          CAMERA ZOOM / POSITION WRAPPER FOR PRELOADER:
          - Initial state: tightly zoomed in (scale: 3.6) at viewport center (top: 50%)
          - Completion (100%): animates scale back down (scale: 1) settling into top: 70%
        */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-25"
          initial={{ top: "50%", scale: 3.6 }}
          animate={{
            top: isLoaded ? "70%" : "50%",
            scale: isLoaded ? 1 : 3.6,
          }}
          transition={{
            duration: 0.95,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ScrollWatch
            handRotation={handRotation}
            scale={dialScale}
            dialRotation={dialRotation}
            orbitAngle={orbitAngle}
            orbitDotScale={orbitDotScale}
            orbitDotOpacity={orbitDotOpacity}
            orbitDotYOffset={orbitDotYOffset}
            labelOpacity={labelOpacity}
            loadProgress={loadProgress}
            isLoaded={isLoaded}
          />
        </motion.div>
      </div>
    </section>
  );
}