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

  const ORBIT_RADIUS = 98; // radius of watch rim in px

  // ── Step 1 & 2: Minute Hand Rotation ───────────────────
  // 0.00 → 0.25: Starts at 12 o'clock (0°) and rotates clockwise to 2 o'clock (60°)
  // 0.25 → 0.70: Connects with dot and rotates together from 2 o'clock (60°) down to 6 o'clock (180°)
  // 0.70 → 1.00: Remains at 6 o'clock (180°)
  const minuteHandRotation = useTransform(
    smooth,
    [0, 0.25, 0.7, 1.0],
    [0, 60, 180, 180]
  );

  // ── Step 1 & 2: Orbit Angle for Circular Math ─────────
  // 0.00 → 0.25: Lime dot stays stationary at 2 o'clock (60°)
  // 0.25 → 0.70: Orbits rim from 2 o'clock (60°) down to 6 o'clock (180°)
  // 0.70 → 1.00: Stays at 6 o'clock (180°)
  const orbitAngle = useTransform(
    smooth,
    [0, 0.25, 0.7, 1.0],
    [60, 60, 180, 180]
  );

  // ── Circular Math ($X = \cos(\text{angle}) \times \text{radius}$, $Y = \sin(\text{angle}) \times \text{radius}$) ──
  // 2 o'clock (60°): angle = -30° → X = cos(-30°) * 98 = +84.87px, Y = sin(-30°) * 98 = -49px
  // 6 o'clock (180°): angle = 90° → X = cos(90°) * 98 = 0px, Y = sin(90°) * 98 = +98px
  const orbitDotX = useTransform(orbitAngle, (deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return Math.cos(rad) * ORBIT_RADIUS;
  });

  const orbitDotY = useTransform(orbitAngle, (deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return Math.sin(rad) * ORBIT_RADIUS;
  });

  // ── Step 3: Straight Downward Exit ─────────────────────
  // 0.70 → 0.95: Moves straight down off the watch face via vertical offset
  const orbitDotYExit = useTransform(
    smooth,
    [0, 0.7, 0.95, 1.0],
    [0, 0, 240, 240]
  );

  // Additional transforms
  const dialRotation = useTransform(smooth, [0, 1.0], [0, 0]); // Stationary watch dial
  const dialScale = useTransform(smooth, [0, 0.6], [1, 1]);
  const orbitDotScale = useTransform(smooth, [0, 1.0], [1, 1]);
  const orbitDotOpacity = useTransform(smooth, [0, 0.85, 0.95], [1, 1, 0]);
  const labelOpacity = useTransform(smooth, [0, 0.08], [1, 0]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: "300vh" }}>
      {/* Fixed Navbar */}
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

        {/* ALTIMA wordmark */}
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

        {/* SOFTWARE SOLUTIONS */}
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

        {/* 3D LIME CUBE */}
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

        {/* CAMERA ZOOM / POSITION WRAPPER FOR PRELOADER */}
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
            minuteHandRotation={minuteHandRotation}
            orbitDotX={orbitDotX}
            orbitDotY={orbitDotY}
            orbitDotYExit={orbitDotYExit}
            scale={dialScale}
            dialRotation={dialRotation}
            orbitDotScale={orbitDotScale}
            orbitDotOpacity={orbitDotOpacity}
            labelOpacity={labelOpacity}
            loadProgress={loadProgress}
            isLoaded={isLoaded}
          />
        </motion.div>
      </div>
    </section>
  );
}