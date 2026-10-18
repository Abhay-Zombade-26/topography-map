"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   PROCESS — "TO DISCOVER → TO DESIGN → TO BUILD → TO LAUNCH"
   Sweet-Tape Style Horizontal Marquee + Dynamic 3D Layering

   Stack:
   - z-index: 10 : Giant typography words ("TO DISCOVER", etc.)
   - z-index: 25 : Floating glass 3D assets crossing over text
   - z-index: 30 : Circular rotating badges & tape photo cards
   - z-index: 35 : Hand-drawn arrows, notes, closing CTA
   - z-index: 40 : Fixed chrome (hanging ribbon, counter, progress)
   - z-index: 42 : Bottom curved lime exit cap sliding up
   ═══════════════════════════════════════════════════════════════ */

const LIME = "#D2FF00";
const BG = "#0B0B0C";
const CREAM = "#EFEBE0";

type Pos = { x: number; y: number; rot?: number };
type Stage = {
  id: string;
  word: string;
  badge: { label: string; sub: string; ring: string; tone: "lime" | "cream" | "ink" };
  note: string;
  card: Pos & { w: string; src?: string; alt?: string };
  badgePos: Pos & { size: string };
  object: Pos & { w: string; src: string };
  notePos: Pos;
  arrowPos: Pos & { w: string };
  cta?: boolean;
};

/* x = % of stage block · y = vh inside stage block */
export const STAGES: Stage[] = [
  {
    id: "discover",
    word: "TO DISCOVER",
    badge: {
      label: "DISCOVER",
      sub: "2 HRS",
      ring: "FREE DISCOVERY CALL · NO PITCH DECKS · JUST FOUNDERS · ",
      tone: "lime",
    },
    note: "every great product starts with one honest conversation",
    card: { x: 20, y: 14, rot: -6, w: "min(30vh,34vw)" },
    badgePos: { x: 62, y: 44, rot: 8, size: "min(34vh,38vw)" },
    object: { x: 38, y: 24, rot: 12, w: "min(28vh,30vw)", src: "/about-us-img/altima_chip.png" },
    notePos: { x: 6, y: 74 },
    arrowPos: { x: 44, y: 66, rot: 4, w: "min(24vh,28vw)" },
  },
  {
    id: "design",
    word: "TO DESIGN",
    badge: {
      label: "DESIGN",
      sub: "FIGMA",
      ring: "BRAND · UI · MOTION · PROTOTYPES · SYSTEMS · ",
      tone: "cream",
    },
    note: "no templates. ever.",
    card: { x: 12, y: 52, rot: 5, w: "min(28vh,32vw)" },
    badgePos: { x: 42, y: 8, rot: -10, size: "min(32vh,36vw)" },
    object: { x: 44, y: 32, rot: -8, w: "min(34vh,36vw)", src: "/about-us-img/glass_monitor.png" },
    notePos: { x: 60, y: 20 },
    arrowPos: { x: 50, y: 42, rot: 18, w: "min(24vh,28vw)" },
  },
  {
    id: "build",
    word: "TO BUILD",
    badge: {
      label: "BUILD",
      sub: "NEXT.JS",
      ring: "NEXT.JS · REACT · GSAP · TYPESCRIPT · SHIPPED CLEAN · ",
      tone: "ink",
    },
    note: "fast, responsive, built to last",
    card: { x: 30, y: 10, rot: -4, w: "min(30vh,34vw)" },
    badgePos: { x: 66, y: 46, rot: 6, size: "min(34vh,38vw)" },
    object: { x: 36, y: 32, rot: 10, w: "min(32vh,36vw)", src: "/about-us-img/glass_terminal.png" },
    notePos: { x: 38, y: 78 },
    arrowPos: { x: 54, y: 28, rot: -10, w: "min(24vh,28vw)" },
  },
  {
    id: "launch",
    word: "TO LAUNCH",
    badge: {
      label: "LAUNCH",
      sub: "DAY ONE",
      ring: "LIVE IN WEEKS · NOT MONTHS · FOUNDERS WHO SHIP · ",
      tone: "lime",
    },
    note: "shipped. now let’s grow it.",
    card: { x: 26, y: 14, rot: 6, w: "min(30vh,34vw)" },
    badgePos: { x: 62, y: 44, rot: -8, size: "min(36vh,40vw)" },
    object: { x: 42, y: 26, rot: -10, w: "min(28vh,30vw)", src: "/about-us-img/altima_chip.png" },
    notePos: { x: 8, y: 74 },
    arrowPos: { x: 48, y: 64, rot: 0, w: "min(24vh,28vw)" },
    cta: true,
  },
];

const TONES = {
  lime: { bg: LIME, fg: "#0B0B0C" },
  cream: { bg: CREAM, fg: "#0B0B0C" },
  ink: { bg: "#17171A", fg: LIME },
};

/* ── round sticker badge (pure SVG, ring text auto-fits the circle) ── */
function Badge({ stage }: { stage: Stage }) {
  const t = TONES[stage.badge.tone];
  const pid = `${stage.id}-ring`;
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: "visible", display: "block" }}>
      <defs>
        <path id={pid} d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
      </defs>
      <circle cx="105" cy="110" r="96" fill="rgba(0,0,0,0.55)" />
      <circle cx="100" cy="100" r="96" fill={t.bg} />
      <circle cx="100" cy="100" r="88" fill="none" stroke={t.fg} strokeOpacity="0.28" strokeWidth="1.5" />
      <g className="badge-ring">
        <text
          fontFamily='"Inter", system-ui, sans-serif'
          fontWeight={700}
          fontSize="11"
          fill={t.fg}
          textLength="446"
          lengthAdjust="spacing"
        >
          <textPath href={`#${pid}`}>{stage.badge.ring}</textPath>
        </text>
      </g>
      <text x="100" y="108" textAnchor="middle" fontFamily='"Anton", sans-serif' fontSize="38" fill={t.fg}>
        {stage.badge.label}
      </text>
      <text
        x="100"
        y="130"
        textAnchor="middle"
        fontFamily='"Inter", system-ui, sans-serif'
        fontWeight={700}
        fontSize="10"
        letterSpacing="3"
        fill={t.fg}
      >
        {stage.badge.sub}
      </text>
    </svg>
  );
}

/* ── hand-drawn arrow (path is drawn on scroll) ── */
function Arrow() {
  return (
    <svg viewBox="0 0 160 70" width="100%" style={{ overflow: "visible", display: "block" }} aria-hidden="true">
      <path
        className="draw"
        d="M3 58 C 38 4, 108 2, 150 46 M150 46 L 135 44 M150 46 L 146 31"
        fill="none"
        stroke={LIME}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── rounded photo card with tape strip ── */
function Card({ stage }: { stage: Stage }) {
  const { card } = stage;
  return (
    <div style={{ position: "relative", width: card.w, aspectRatio: "1 / 1" }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-5%",
          left: "28%",
          width: "44%",
          height: "13%",
          background: "rgba(222,196,150,0.92)",
          transform: "rotate(-3deg)",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "16%",
          overflow: "hidden",
          background: "linear-gradient(145deg,#232327 0%,#121214 100%)",
          border: "1px solid rgba(210,255,0,0.35)",
          boxShadow: "9px 11px 0 rgba(210,255,0,0.22)",
          display: "grid",
          placeItems: "center",
        }}
      >
        {card.src ? (
          <img src={card.src} alt={card.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.25em",
              color: "rgba(239,235,224,0.45)",
            }}
          >
            ADD IMAGE
          </span>
        )}
      </div>
    </div>
  );
}

export default function Process({ variant = "home" }: { variant?: "home" | "compact" }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const bottomCurveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "home") return;
    const wrap = wrapRef.current;
    const section = sectionRef.current;
    const intro = introRef.current;
    const track = trackRef.current;
    const bar = barRef.current;
    const num = numRef.current;
    const name = nameRef.current;
    const bottomCurve = bottomCurveRef.current;
    if (!wrap || !section || !intro || !track || !bar || !num || !name || !bottomCurve) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(intro, { opacity: 1, y: 0 });
      gsap.set(track, { opacity: 1, y: 0, x: 0 });
      gsap.set(".p-fade", { opacity: 1, y: 0 });
      return;
    }

    let ctx: gsap.Context | null = null;

    const build = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        const vw = window.innerWidth;

        const travel = Math.max(0, track.scrollWidth - vw);
        // Direct horizontal travel — mounts immediately against Services with zero empty void gap
        const total = travel * 0.95;

        /* ── INITIAL STATES (explicit from & to for 100% reversible scrub) ── */
        gsap.set(intro, { y: 0, opacity: 1 });
        gsap.set(track, { x: 0, y: 0 }); // immediately centered and visible!
        gsap.set(bar, { scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(".p-fade", { opacity: 0, y: 16 });
        gsap.set(bottomCurve, { yPercent: 105 });
        gsap.set(section, { borderBottomLeftRadius: "0% 0px", borderBottomRightRadius: "0% 0px" });

        /* ── MAIN PINNED TIMELINE ── */
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${total}`,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        });

        // Ensure pin spacer background is pure black to eliminate any unpinned cream gap
        const spacer = section.parentElement;
        if (spacer && spacer.classList.contains("pin-spacer")) {
          spacer.style.backgroundColor = "#000000";
        }

        // 1. Intro statement lifts away quickly as the horizontal scroll starts
        tl.fromTo(
          intro,
          { y: 0, opacity: 1 },
          { y: -45, opacity: 0, ease: "power1.out", duration: 0.12 },
          0
        );

        // 2. Track horizontal travel across the entire duration (starts immediately!)
        tl.fromTo(track, { x: 0 }, { x: -travel, duration: 1, ease: "none" }, 0);
        tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "none" }, 0);

        /* ── DYNAMIC 3D LAYERING & PARALLAX OVERLAPPING ── */

        // Floating Glass Assets (z-index 25): directly cross over and glide across typography
        section.querySelectorAll<HTMLElement>("[data-glass]").forEach((el) => {
          const rot = parseFloat(el.dataset["rot"] || "0");
          tl.fromTo(
            el,
            { x: 100, rotation: rot - 5 },
            { x: -180, rotation: rot + 6, duration: 1, ease: "none" },
            0
          );
        });

        // Circular Process Badges (z-index 30): stacked on top of glass assets with faster glide
        section.querySelectorAll<HTMLElement>("[data-badge]").forEach((el) => {
          const rot = parseFloat(el.dataset["rot"] || "0");
          tl.fromTo(
            el,
            { x: 160, rotation: rot - 10, scale: 0.95 },
            { x: -280, rotation: rot + 12, scale: 1.05, duration: 1, ease: "none" },
            0
          );
        });

        // Tape Photo Cards (z-index 30): subtle counter-parallax drift
        section.querySelectorAll<HTMLElement>("[data-card]").forEach((el) => {
          const rot = parseFloat(el.dataset["rot"] || "0");
          tl.fromTo(
            el,
            { x: -60, rotation: rot - 4 },
            { x: 100, rotation: rot + 4, duration: 1, ease: "none" },
            0
          );
        });

        // Hand-drawn arrows & Handwritten notes fade/draw when reaching reading zone
        const trackLeft = track.getBoundingClientRect().left;
        const timeAt = (el: Element) => {
          const r = el.getBoundingClientRect();
          const center = r.left - trackLeft + r.width / 2;
          const f = travel > 0 ? (center - vw * 0.62) / travel : 0;
          return Math.min(0.92, Math.max(0.04, f));
        };

        section.querySelectorAll<SVGPathElement>("path.draw").forEach((path) => {
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          const t = Math.max(0, timeAt(path.ownerSVGElement as Element) - 0.03);
          tl.fromTo(
            path,
            { strokeDashoffset: len },
            { strokeDashoffset: 0, ease: "power1.out", duration: 0.08 },
            t
          );
        });

        section.querySelectorAll<HTMLElement>(".p-fade").forEach((el) => {
          const t = Math.max(0, timeAt(el) - 0.04);
          tl.fromTo(
            el,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, ease: "power2.out", duration: 0.06 },
            t
          );
        });

        /* ── BOTTOM SECTION TRANSITION CURVE (HALF CURVE SLIDES UP AT THE END) ── */
        tl.fromTo(
          bottomCurve,
          { yPercent: 105 },
          { yPercent: 0, ease: "power2.inOut", duration: 0.14 },
          0.86
        );
        tl.fromTo(
          section,
          { borderBottomLeftRadius: "0% 0px", borderBottomRightRadius: "0% 0px" },
          {
            borderBottomLeftRadius: "50% 80px",
            borderBottomRightRadius: "50% 80px",
            ease: "power2.inOut",
            duration: 0.14,
          },
          0.86
        );

        /* ── Counter updates to the word nearest viewport center ── */
        const blocks = Array.from(track.querySelectorAll<HTMLElement>("[data-block]"));
        const centers = blocks.map((b) => {
          const r = b.getBoundingClientRect();
          return r.left - trackLeft + r.width / 2;
        });
        let current = -1;
        tl.eventCallback("onUpdate", () => {
          const x = gsap.getProperty(track, "x") as number;
          const mid = -x + vw / 2;
          let best = 0;
          centers.forEach((c, i) => {
            const bestCenter = centers[best] ?? 0;
            if (Math.abs(c - mid) < Math.abs(bestCenter - mid)) best = i;
          });
          if (best !== current) {
            current = best;
            num.textContent = String(best + 1).padStart(2, "0");
            name.textContent = blocks[best]?.dataset["name"] || "";
          }
        });

        /* Badge rings spin forever independently of scroll */
        gsap.to(".badge-ring", {
          rotation: 360,
          svgOrigin: "100 100",
          duration: 32,
          repeat: -1,
          ease: "none",
        });
      }, section);
    };

    build();

    document.fonts?.ready.then(() => {
      build();
      ScrollTrigger.refresh();
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(build, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
      ctx?.revert();
    };
  }, [variant]);

  /* ───────────────── compact variant: plain list, no pin ───────────────── */
  if (variant === "compact") {
    return (
      <section style={{ background: BG, color: LIME, padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: "2.5rem" }}>
          {STAGES.map((s, i) => (
            <div
              key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "4rem 1fr",
                gap: "1.5rem",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: CREAM,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: '"Anton", sans-serif',
                    fontSize: "clamp(2.5rem,7vw,5rem)",
                    lineHeight: 0.95,
                  }}
                >
                  {s.word}
                </div>
                <p
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    color: CREAM,
                    opacity: 0.8,
                    marginTop: "0.5rem",
                  }}
                >
                  {s.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ───────────────────────────── home variant ───────────────────────────── */
  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        width: "100%",
        backgroundColor: "#000000",
        color: LIME,
        overflow: "hidden",
      }}
    >
      <section
        ref={sectionRef}
        id="process"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: BG,
          color: LIME,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      >
        {/* ── INTRO: Pill badge + headline (centered above words, lifts away on scroll) ── */}
        <div
          ref={introRef}
          style={{
            position: "absolute",
            top: "7vh",
            left: 0,
            right: 0,
            zIndex: 15,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            padding: "0 1.5rem",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.45rem 0.9rem",
              borderRadius: 8,
              background: LIME,
              color: BG,
              fontFamily: '"Anton", sans-serif',
              fontSize: "0.8rem",
              letterSpacing: "0.12em",
            }}
          >
            <span aria-hidden="true" style={{ display: "grid", gap: 2 }}>
              <i style={{ width: 3, height: 3, borderRadius: "50%", background: BG, display: "block" }} />
              <i style={{ width: 3, height: 3, borderRadius: "50%", background: BG, display: "block" }} />
              <i style={{ width: 3, height: 3, borderRadius: "50%", background: BG, display: "block" }} />
            </span>
            HOW WE WORK
          </span>
          <h2
            style={{
              margin: 0,
              fontFamily: '"Anton", sans-serif',
              fontWeight: 400,
              textTransform: "uppercase",
              lineHeight: 0.94,
              letterSpacing: "-0.01em",
              fontSize: "clamp(2rem, 5vw, 4.4rem)",
              maxWidth: "18ch",
            }}
          >
            WE’RE HERE FOR THE FOUNDERS WHO SHIP.
          </h2>
        </div>

        {/* ── GIANT WORD TRACK & DYNAMIC 3D OVERLAPPING LAYERS ── */}
        <div
          ref={trackRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100vh",
            display: "flex",
            alignItems: "center",
            padding: "0 12vw 0 6vw",
            willChange: "transform",
            zIndex: 5,
          }}
        >
          {STAGES.map((s) => (
            <div
              key={s.id}
              data-block
              data-name={s.id.toUpperCase()}
              style={{
                position: "relative",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                flex: "0 0 auto",
                padding: "0 5vw",
              }}
            >
              {/* 1. GIANT MARQUEE TYPOGRAPHY (z-index: 10) */}
              <span
                style={{
                  fontFamily: '"Anton", sans-serif',
                  fontSize: "min(40vh, 56vw)",
                  lineHeight: 0.82,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  color: LIME,
                  userSelect: "none",
                  position: "relative",
                  zIndex: 10,
                }}
              >
                {s.word}
              </span>

              {/* 2. FLOATING GLASS ASSET (z-index: 25): directly crosses over and overlaps typography */}
              <div
                data-glass
                data-rot={s.object.rot ?? 0}
                style={{
                  position: "absolute",
                  left: `${s.object.x}%`,
                  top: `${s.object.y}vh`,
                  width: s.object.w,
                  zIndex: 25,
                  pointerEvents: "none",
                }}
              >
                <img
                  src={s.object.src}
                  alt=""
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    filter: "drop-shadow(0 24px 35px rgba(0,0,0,0.7))",
                  }}
                />
              </div>

              {/* 3. CIRCULAR PROCESS BADGE (z-index: 30): stacked on top of glass assets & text */}
              <div
                data-badge
                data-rot={s.badgePos.rot ?? 0}
                style={{
                  position: "absolute",
                  left: `${s.badgePos.x}%`,
                  top: `${s.badgePos.y}vh`,
                  width: s.badgePos.size,
                  aspectRatio: "1 / 1",
                  zIndex: 30,
                }}
              >
                <Badge stage={s} />
              </div>

              {/* 4. TAPE PHOTO CARD (z-index: 30): stacked with subtle parallax */}
              <div
                data-card
                data-rot={s.card.rot ?? 0}
                style={{
                  position: "absolute",
                  left: `${s.card.x}%`,
                  top: `${s.card.y}vh`,
                  zIndex: 30,
                }}
              >
                <Card stage={s} />
              </div>

              {/* 5. HAND-DRAWN ARROW (z-index: 35) */}
              <div
                style={{
                  position: "absolute",
                  left: `${s.arrowPos.x}%`,
                  top: `${s.arrowPos.y}vh`,
                  width: s.arrowPos.w,
                  transform: `rotate(${s.arrowPos.rot ?? 0}deg)`,
                  zIndex: 35,
                  pointerEvents: "none",
                }}
              >
                <Arrow />
              </div>

              {/* 6. HANDWRITTEN NOTE WITH BRACKET MARK (z-index: 35) */}
              <div
                className="p-fade"
                style={{
                  position: "absolute",
                  left: `${s.notePos.x}%`,
                  top: `${s.notePos.y}vh`,
                  zIndex: 35,
                  display: "flex",
                  gap: "0.6rem",
                  alignItems: "flex-start",
                  maxWidth: "17ch",
                  color: CREAM,
                  pointerEvents: "none",
                }}
              >
                <svg
                  width="22"
                  height="30"
                  viewBox="0 0 22 30"
                  aria-hidden="true"
                  style={{ flex: "none", opacity: 0.8 }}
                >
                  <path d="M2 2 V28 M2 28 H20" fill="none" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span
                  style={{
                    fontFamily: '"Caveat","Segoe Script",cursive',
                    fontSize: "clamp(1.1rem,1.7vw,1.5rem)",
                    lineHeight: 1.05,
                    transform: "rotate(-3deg)",
                  }}
                >
                  {s.note}
                </span>
              </div>

              {/* 7. CLOSING CTA (z-index: 35) */}
              {s.cta && (
                <a
                  href="/contact"
                  className="p-fade"
                  style={{
                    position: "absolute",
                    right: "4vw",
                    bottom: "9vh",
                    zIndex: 35,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "1rem 1.6rem",
                    borderRadius: 999,
                    background: LIME,
                    color: BG,
                    fontFamily: '"Anton", sans-serif',
                    fontSize: "1rem",
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                  }}
                >
                  START YOUR PROJECT ↗
                </a>
              )}
            </div>
          ))}
        </div>

        {/* ── HANGING RIBBON (z-index: 40) ── */}
        <a
          href="/contact"
          style={{
            position: "absolute",
            top: 0,
            right: "2.2rem",
            zIndex: 40,
            width: 112,
            padding: "1.1rem 0 1.9rem",
            background: CREAM,
            color: BG,
            textAlign: "center",
            textDecoration: "none",
            clipPath: "polygon(0 0,100% 0,100% 100%,50% 86%,0 100%)",
            fontFamily: '"Anton", sans-serif',
            fontSize: "0.78rem",
            letterSpacing: "0.1em",
            lineHeight: 1.2,
          }}
        >
          <span style={{ display: "block", borderTop: `2px dotted ${BG}`, marginBottom: "0.5rem" }} />
          FREE DEMO
          <br />
          IN 2 HRS
        </a>

        {/* ── COUNTER + PROGRESS (z-index: 40) ── */}
        <div
          style={{
            position: "absolute",
            left: "2.2rem",
            bottom: "2rem",
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            gap: "0.9rem",
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: CREAM,
            pointerEvents: "none",
          }}
        >
          <span ref={numRef}>01</span>
          <span style={{ opacity: 0.45 }}>/ 0{STAGES.length}</span>
          <span ref={nameRef} style={{ color: LIME }}>
            DISCOVER
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            background: "rgba(239,235,224,0.12)",
            zIndex: 40,
          }}
        >
          <div ref={barRef} style={{ width: "100%", height: "100%", background: LIME }} />
        </div>

        {/* ── BOTTOM SECTION TRANSITION CURVE (HALF CURVE) (z-index: 42) ── */}
        <div
          ref={bottomCurveRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "18vh",
            overflow: "hidden",
            zIndex: 42,
            pointerEvents: "none",
            transform: "translate3d(0, 105%, 0)",
          }}
        >
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <path
              d="M0,120 L1440,120 L1440,20 Q720,0 0,20 Z"
              fill={LIME}
            />
          </svg>
        </div>
      </section>
    </div>
  );
}