import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 30%"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.6,
  });

  // Scale origin at top edge (bottom edge of hero container)
  // Expands strictly downward into Section 2
  const scaleY = useTransform(smooth, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen w-full select-none flex flex-col justify-center items-start px-8 md:px-16 py-24 overflow-hidden"
      style={{
        backgroundColor: "#EFEBE0",
        color: "#111112",
      }}
    >
      {/* Solid Lime (#D2FF00) Background Wipe:
          Anchored at top edge (transformOrigin: "center top" relative to Section 2)
          Expands strictly downward into Section 2 */}
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

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        <span
          style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
          className="text-xs uppercase tracking-[0.25em] text-[#111112]/60"
        >
          About Altima
        </span>
        <h2
          style={{ fontFamily: '"Anton", sans-serif' }}
          className="mt-6 text-5xl md:text-8xl font-normal uppercase tracking-tight text-[#111112] leading-[0.9]"
        >
          Software Studio for Founders Who Ship
        </h2>
        <p
          style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
          className="mt-8 text-lg md:text-2xl text-[#111112]/80 max-w-2xl leading-relaxed"
        >
          We partner with ambitious early-stage founders to design, engineer, and
          ship bold digital products that define their categories.
        </p>
      </div>
    </section>
  );
}
