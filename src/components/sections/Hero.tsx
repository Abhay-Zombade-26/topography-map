import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Topography from "@/components/webgl/Topography";
import Nav from "@/components/ui/Nav";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Phase = "countdown" | "reveal" | "type" | "nav" | "settled";

function Countdown() {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1800;
    const jitter = 300;

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < jitter) {
        setValue(Math.floor(Math.random() * 101));
      } else {
        const t = Math.min((elapsed - jitter) / (duration - jitter), 1);
        // expo.out easing
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setValue(Math.floor(eased * 100));
      }
      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(100);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <span className="font-display font-bold uppercase tabular-nums text-paper text-[clamp(120px,28vw,480px)] leading-none">
      {value}
    </span>
  );
}

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduceMotion ? "settled" : "countdown");

  useEffect(() => {
    if (reduceMotion) {
      setPhase("settled");
      return;
    }
    const timers = [
      setTimeout(() => setPhase("reveal"), 2000),
      setTimeout(() => setPhase("type"), 3200),
      setTimeout(() => setPhase("nav"), 4300),
      setTimeout(() => setPhase("settled"), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduceMotion]);

  const revealed = phase !== "countdown";
  const typed = phase === "type" || phase === "nav" || phase === "settled";
  const navIn = phase === "nav" || phase === "settled";

  return (
    <section className="relative h-screen w-full overflow-hidden bg-ink-900">
      {/* Layer 1: Topography WebGL background */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 8, rotate: -3, opacity: 0 }}
        animate={
          revealed
            ? { scale: 2.5, rotate: 0, opacity: 1 }
            : { scale: 8, rotate: -3, opacity: 1 }
        }
        transition={
          revealed
            ? { duration: 1.2, ease: EASE }
            : { duration: 0.4, ease: EASE }
        }
      >
        <Topography
          lowColor="#D2FF00"
          midColor="#111112"
          highColor="#F4F4F0"
          speed={0.15}
          morphAmount={1.8}
          morphSpeed={0.03}
          bands={3}
          thickness={0.02}
          scale={2.5}
          pixelSize={1.0}
          glow={0.35}
          colorMode="elevation"
          contrast={3.0}
          brightness={0.8}
          fillBands={false}
          opacity={1.0}
          grain={true}
          grainIntensity={0.04}
          mouseInteraction={true}
          mouseRadius={0.4}
          mouseStrength={0.5}
        />
      </motion.div>

      {/* Layer 2: Radial vignette */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#111112_90%)]"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: revealed ? 1 : 0.6 }}
        transition={{ duration: 0.8, ease: EASE }}
      />

      {/* Layer 3: Countdown number */}
      {!typed && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          animate={
            revealed
              ? { scale: 1.15, opacity: 0, filter: "blur(12px)" }
              : { scale: 1, opacity: 1, filter: "blur(0px)" }
          }
          transition={{ duration: 0.5, ease: EASE }}
        >
          <Countdown />
        </motion.div>
      )}

      {/* Countdown corner labels */}
      {!typed && (
        <>
          <motion.span
            className="absolute left-6 top-24 font-display text-xs uppercase tracking-[0.25em] text-paper/50 md:left-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            ALTIMA / 001
          </motion.span>
          <motion.span
            className="absolute right-6 top-24 font-display text-xs uppercase tracking-[0.25em] text-paper/50 md:right-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            LOADING FIELD
          </motion.span>
        </>
      )}

      {/* Layer 4: Hero headline */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="overflow-hidden">
          <motion.h1
            className="whitespace-nowrap font-display text-[17vw] font-bold uppercase leading-[0.85] tracking-[-0.04em]"
            initial={{ y: "120%" }}
            animate={typed ? { y: "0%" } : { y: "120%" }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <span className="text-paper">BUILD</span>{" "}
            <span className="text-lime-500">BOLD</span>
          </motion.h1>
        </div>
        <motion.p
          className="mt-6 max-w-lg text-center font-serif text-lg italic text-paper/70 md:text-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={typed ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
        >
          Software, engineered for founders who ship.
        </motion.p>
      </div>

      {/* Layer 5: Corner anchors */}
      <motion.span
        className="absolute bottom-8 left-6 font-serif text-xl italic text-paper/80 md:left-10"
        initial={{ opacity: 0 }}
        animate={navIn ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        Est. 2025
      </motion.span>
      <motion.span
        className="absolute bottom-8 right-6 font-serif text-xl italic text-paper/80 md:right-10"
        initial={{ opacity: 0 }}
        animate={navIn ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
      >
        Scroll to explore ↓
      </motion.span>

      {/* Layer 6: Nav */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={navIn ? { y: 0, opacity: 1 } : { y: -20, opacity: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <Nav />
      </motion.div>
    </section>
  );
}
