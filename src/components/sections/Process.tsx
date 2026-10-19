"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   PROCESS — "TO DISCOVER → TO DESIGN → TO BUILD → TO LAUNCH"
   Dark (#0B0B0C) + lime (#D2FF00). Place AFTER <Services />.
   (Images live in <Showcase /> — this file is 100% type + SVG.)

   • CURVE    : in-flow divider ends Services with a lime arc.
   • INTRO    : scattered letters assemble while the section scrolls in.
   • STICKY   : CSS position:sticky (no GSAP pin-spacer to drift).
                One scrubbed timeline → camera rides a CURVED route
                through 4 words that zig-zag up/down. Symmetric reverse.
   • INTERACT : cursor parallax on badges/bursts · letters under the
                cursor lift · badges react on hover · stage buttons
                (bottom-left) smooth-scroll to any word · CTA hover.
   Fonts: Anton, Inter, Caveat.
   ═══════════════════════════════════════════════════════════════ */

const LIME = "#D2FF00";
const BG = "#0B0B0C";
const CREAM = "#EFEBE0";

type Stage = {
  id: string;
  word: string;
  badge: { label: string; sub: string; ring: string; tone: "lime" | "cream" | "ink" };
  note: string;
  /* x = % of word width · y = vh · size = vh */
  badgePos: { x: number; y: number; rot: number; size: number };
  burst: { x: number; y: number; rot: number; size: number };
  notePos: { x: number; y: number };
  cta?: boolean;
};

const v = (n: number) => `min(${n}vh, ${(n * 1.15).toFixed(2)}vw)`;

export const STAGES: Stage[] = [
  {
    id: "discover",
    word: "TO DISCOVER",
    badge: { label: "DISCOVER", sub: "2 HRS", ring: "FREE DISCOVERY CALL · NO PITCH DECKS · JUST FOUNDERS · ", tone: "lime" },
    note: "every great product starts with one honest conversation",
    badgePos: { x: 64, y: 6, rot: 8, size: 32 },
    burst: { x: 22, y: 12, rot: 12, size: 11 },
    notePos: { x: 5, y: 76 },
  },
  {
    id: "design",
    word: "TO DESIGN",
    badge: { label: "DESIGN", sub: "FIGMA", ring: "BRAND · UI · MOTION · PROTOTYPES · SYSTEMS · ", tone: "cream" },
    note: "no templates. ever.",
    badgePos: { x: 18, y: 58, rot: -10, size: 30 },
    burst: { x: 78, y: 14, rot: -8, size: 12 },
    notePos: { x: 62, y: 74 },
  },
  {
    id: "build",
    word: "TO BUILD",
    badge: { label: "BUILD", sub: "NEXT.JS", ring: "NEXT.JS · REACT · GSAP · TYPESCRIPT · SHIPPED CLEAN · ", tone: "ink" },
    note: "fast, responsive, built to last",
    badgePos: { x: 68, y: 60, rot: 6, size: 32 },
    burst: { x: 16, y: 16, rot: 20, size: 11 },
    notePos: { x: 36, y: 12 },
  },
  {
    id: "launch",
    word: "TO LAUNCH",
    badge: { label: "LAUNCH", sub: "DAY ONE", ring: "LIVE IN WEEKS · NOT MONTHS · FOUNDERS WHO SHIP · ", tone: "lime" },
    note: "shipped. now let’s grow it.",
    badgePos: { x: 58, y: 8, rot: -8, size: 34 },
    burst: { x: 14, y: 62, rot: 10, size: 12 },
    notePos: { x: 6, y: 78 },
    cta: true,
  },
];

const INTRO_LINES = ["WE’RE HERE FOR", "THE FOUNDERS", "WHO SHIP."];

const TONES = {
  lime: { bg: LIME, fg: "#0B0B0C" },
  cream: { bg: CREAM, fg: "#0B0B0C" },
  ink: { bg: "#17171A", fg: LIME },
};

function Letters({ text, className }: { text: string; className: string }) {
  return (
    <>
      {Array.from(text).map((ch, k) =>
        ch === " " ? (
          <span key={k} aria-hidden="true" style={{ display: "inline-block", width: "0.26em" }} />
        ) : (
          <span key={k} className={className} aria-hidden="true" style={{ display: "inline-block" }}>
            {ch}
          </span>
        )
      )}
    </>
  );
}

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
        <text fontFamily='"Inter", system-ui, sans-serif' fontWeight={700} fontSize="11" fill={t.fg} textLength="446" lengthAdjust="spacing">
          <textPath href={`#${pid}`}>{stage.badge.ring}</textPath>
        </text>
      </g>
      <text x="100" y="108" textAnchor="middle" fontFamily='"Anton", sans-serif' fontSize="38" fill={t.fg}>
        {stage.badge.label}
      </text>
      <text x="100" y="130" textAnchor="middle" fontFamily='"Inter", system-ui, sans-serif' fontWeight={700} fontSize="10" letterSpacing="3" fill={t.fg}>
        {stage.badge.sub}
      </text>
    </svg>
  );
}

/* hand-drawn 8-point burst (outline) */
function Burst() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <path
        d="M50 4 L58 36 L88 18 L68 44 L98 50 L68 56 L88 82 L58 64 L50 96 L42 64 L12 82 L32 56 L2 50 L32 44 L12 18 L42 36 Z"
        fill="none"
        stroke={LIME}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

/* ═════════════ curved route (Hermite spline + arc-length table) ═════════════ */
type V = { x: number; y: number };
type LutPt = V & { l: number };

function buildRoute(pts: V[]) {
  const lut: LutPt[] = [];
  const segStart: number[] = [];
  const T = 0.32;
  const tan = (i: number): V => {
    const a = pts[Math.max(0, i - 1)]!;
    const b = pts[Math.min(pts.length - 1, i + 1)]!;
    return { x: (b.x - a.x) * T, y: (b.y - a.y) * T };
  };
  let len = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i]!;
    const p1 = pts[i + 1]!;
    const m0 = tan(i);
    const m1 = tan(i + 1);
    segStart.push(lut.length);
    for (let k = 0; k < 28; k++) {
      const t = k / 28;
      const t2 = t * t;
      const t3 = t2 * t;
      const x = (2 * t3 - 3 * t2 + 1) * p0.x + (t3 - 2 * t2 + t) * m0.x + (-2 * t3 + 3 * t2) * p1.x + (t3 - t2) * m1.x;
      const y = (2 * t3 - 3 * t2 + 1) * p0.y + (t3 - 2 * t2 + t) * m0.y + (-2 * t3 + 3 * t2) * p1.y + (t3 - t2) * m1.y;
      const prev = lut[lut.length - 1];
      if (prev) len += Math.hypot(x - prev.x, y - prev.y);
      lut.push({ x, y, l: len });
    }
  }
  const last = pts[pts.length - 1]!;
  const prev = lut[lut.length - 1]!;
  len += Math.hypot(last.x - prev.x, last.y - prev.y);
  segStart.push(lut.length);
  lut.push({ x: last.x, y: last.y, l: len });

  const total = len;
  const pos = (u: number): V => {
    const target = Math.min(1, Math.max(0, u)) * total;
    let lo = 0;
    let hi = lut.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (lut[mid]!.l < target) lo = mid;
      else hi = mid;
    }
    const a = lut[lo]!;
    const b = lut[hi]!;
    const f = b.l === a.l ? 0 : (target - a.l) / (b.l - a.l);
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  };
  const uNear = (wx: number, wy: number, offX: number, offY: number) => {
    let best = 0;
    let bd = Infinity;
    for (let i = 0; i < lut.length; i++) {
      const d = Math.hypot(lut[i]!.x + offX - wx, lut[i]!.y + offY - wy);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return lut[best]!.l / total;
  };
  return { lut, segStart, total, pos, uNear };
}

export default function Process({ variant = "home" }: { variant?: "home" | "compact" }) {
  const stickRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);
  const targetsRef = useRef<number[]>([]);

  const go = (i: number) => {
    const y = targetsRef.current[i];
    if (y !== undefined) window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    if (variant !== "home") return;
    const stick = stickRef.current;
    const section = sectionRef.current;
    const intro = introRef.current;
    const pill = pillRef.current;
    const track = trackRef.current;
    const bar = barRef.current;
    const cursorEl = cursorRef.current;
    const cursorLabel = cursorLabelRef.current;
    if (!stick || !section || !intro || !pill || !track || !bar || !cursorEl || !cursorLabel) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(".p-fade", { opacity: 1 });
      return;
    }

    let ctx: gsap.Context | null = null;
    let disposed = false;
    let stopTick: (() => void) | null = null;

    const build = () => {
      if (disposed) return;
      stopTick?.();
      ctx?.revert();
      ctx = gsap.context(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        /* ───────── world layout: each word on its own zig-zag row ───────── */
        const blocks = Array.from(track.querySelectorAll<HTMLElement>("[data-block]"));
        const rowY = [0, 0.5, -0.1, 0.44];
        const tilt = [-2, 2.5, -2.5, 2];
        const gap = vw * 0.2;
        let cursor = vw * 0.04;
        const info = blocks.map((b, i) => {
          const y = (rowY[i] ?? 0) * vh;
          b.style.left = `${cursor}px`;
          b.style.top = `${y}px`;
          b.style.transform = `rotate(${tilt[i] ?? 0}deg)`;
          const w = b.offsetWidth;
          const left = cursor;
          cursor = left + w + gap;
          return { left, right: left + w, y, w };
        });

        const pts: V[] = [];
        info.forEach(({ left, right, y }) => {
          const sx = left - vw * 0.06;
          pts.push({ x: sx, y });
          pts.push({ x: Math.max(sx + 1, right - vw * 0.94), y });
        });
        const route = buildRoute(pts);
        const cam0 = pts[0]!;

        const introPx = vh * 1.0;
        const total = introPx + route.total * 0.82;
        const p0 = introPx / total;
        const run = 1 - p0;

        /* ───────── cached measurements ───────── */
        const worldOf = (el: HTMLElement) => {
          const b = el.closest<HTMLElement>("[data-block]");
          return {
            x: (b ? b.offsetLeft : 0) + el.offsetLeft + el.offsetWidth / 2,
            y: (b ? b.offsetTop : 0) + el.offsetTop + el.offsetHeight / 2,
          };
        };
        const par = Array.from(section.querySelectorAll<HTMLElement>("[data-depth]")).map((el) => {
          const w = worldOf(el);
          return {
            el,
            depth: parseFloat(el.dataset["depth"] || "0"),
            rot: parseFloat(el.dataset["rot"] || "0"),
            mag: el.classList.contains("p-badge"), // badges are magnetic
            wx: w.x,
            wy: w.y,
          };
        });
        const letters = Array.from(track.querySelectorAll<HTMLElement>(".wl")).map((el) => {
          const b = el.closest<HTMLElement>("[data-block]")!;
          return { el, lx: b.offsetLeft + el.offsetLeft + el.offsetWidth / 2 };
        });
        const navBtns = Array.from(section.querySelectorAll<HTMLElement>(".p-nav"));

        /* arrows in the gaps, aimed along the route */
        const arrows = Array.from(section.querySelectorAll<HTMLElement>(".p-arrow"));
        const arrowU: number[] = [];
        arrows.forEach((a, g) => {
          const s0 = route.segStart[2 * g + 1] ?? 0;
          const s1 = route.segStart[2 * g + 2] ?? s0 + 1;
          const mid = Math.max(1, Math.min(route.lut.length - 2, Math.round((s0 + s1) / 2)));
          const c = route.lut[mid]!;
          const pa = route.lut[mid - 1]!;
          const pb = route.lut[mid + 1]!;
          const ang = (Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180) / Math.PI;
          const w = Math.min(0.36 * vh, 0.34 * vw);
          a.style.width = `${w}px`;
          a.style.left = `${c.x + vw / 2 - w / 2}px`;
          a.style.top = `${c.y + vh / 2 - (w * 70) / 160 / 2}px`;
          a.style.transform = `rotate(${ang}deg)`;
          arrowU[g] = c.l / route.total;
        });

        /* ───────── state: scroll (S) + cursor (M) → one paint() ───────── */
        const S = { u: 0, rise: vh * 0.58 };
        const M = { x: vw / 2, y: vh / 2, a: 0 }; // smoothed cursor (px) + presence 0..1
        const target = { x: vw / 2, y: vh / 2, a: 0 };
        let cam: V = { ...cam0 };
        let activeStage = -1;

        const paint = () => {
          const dx = cam.x - cam0.x;
          const dy = cam.y - cam0.y;
          const mx = ((M.x / vw) - 0.5) * 2 * M.a;
          const my = ((M.y / vh) - 0.5) * 2 * M.a;
          for (const p of par) {
            let px = -dx * p.depth + mx * p.depth * 90;
            let py = -dy * p.depth + my * p.depth * 90;
            if (p.mag && M.a > 0.01) {
              /* magnetic: badge leans toward the cursor when it is near */
              const sx = p.wx - cam.x + px;
              const sy = p.wy - cam.y + S.rise + py;
              const ddx = M.x - sx;
              const ddy = M.y - sy;
              const dist = Math.hypot(ddx, ddy);
              const R = Math.min(vw, vh) * 0.42;
              if (dist < R) {
                const f = (1 - dist / R) ** 2 * 0.28 * M.a;
                px += ddx * f;
                py += ddy * f;
              }
            }
            p.el.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${p.rot + (S.u * 8 - 4)}deg)`;
          }
          for (const l of letters) {
            const sx = l.lx - cam.x; // letter x on screen
            const nx = sx / vw - 0.5;
            const rot = -nx * 5;
            const sag = nx * nx * vh * 0.07;
            const d = Math.abs(sx - M.x) / vw;
            const lift = d < 0.13 ? (1 - d / 0.13) ** 2 * vh * 0.05 * M.a : 0; // letters near cursor rise
            l.el.style.transform = `translate3d(0, ${sag - lift}px, 0) rotate(${rot}deg)`;
          }
        };

        const apply = () => {
          cam = route.pos(S.u);
          track.style.transform = `translate3d(${-cam.x}px, ${-cam.y + S.rise}px, 0)`;
          bar.style.transform = `scaleX(${S.u})`;
          paint();

          const midX = cam.x + vw / 2;
          let best = 0;
          info.forEach((b, i) => {
            const c = b.left + b.w / 2;
            const bc = (info[best]?.left ?? 0) + (info[best]?.w ?? 0) / 2;
            if (Math.abs(c - midX) < Math.abs(bc - midX)) best = i;
          });
          if (best !== activeStage) {
            activeStage = best;
            navBtns.forEach((b, i) => {
              b.style.opacity = i === best ? "1" : "0.42";
              b.style.color = i === best ? LIME : CREAM;
            });
          }
        };

        /* cursor follower + drag-to-scroll + smoothing (own ticker, removed on rebuild/unmount) */
        let label = "DRAG";
        let big = false;
        let dragging = false;
        let lx0 = 0;
        let ly0 = 0;
        const setLabel = (t: string) => {
          if (t !== label) {
            label = t;
            cursorLabel.textContent = t;
          }
        };
        const onMove = (e: PointerEvent) => {
          target.x = e.clientX;
          target.y = e.clientY;
          target.a = 1;
          const hit = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
          big = !!hit && !dragging;
          setLabel(dragging ? "DRAGGING" : hit?.dataset["cursor"] ?? "DRAG");
          if (dragging) {
            /* content follows the hand: drag left / up = move forward */
            const ddx = e.clientX - lx0;
            const ddy = e.clientY - ly0;
            lx0 = e.clientX;
            ly0 = e.clientY;
            window.scrollBy(0, -(ddx * 1.5 + ddy * 1.1));
          }
        };
        const onLeave = () => {
          target.a = 0;
        };
        const onDown = (e: PointerEvent) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          if ((e.target as HTMLElement).closest("a,button")) return;
          dragging = true;
          lx0 = e.clientX;
          ly0 = e.clientY;
          section.style.cursor = "grabbing";
          section.setPointerCapture(e.pointerId);
          setLabel("DRAGGING");
        };
        const onUp = (e: PointerEvent) => {
          if (!dragging) return;
          dragging = false;
          section.style.cursor = "grab";
          if (section.hasPointerCapture(e.pointerId)) section.releasePointerCapture(e.pointerId);
          setLabel("DRAG");
        };
        section.addEventListener("pointermove", onMove);
        section.addEventListener("pointerleave", onLeave);
        section.addEventListener("pointerdown", onDown);
        section.addEventListener("pointerup", onUp);
        section.addEventListener("pointercancel", onUp);
        const tick = () => {
          const nx = M.x + (target.x - M.x) * 0.14;
          const ny = M.y + (target.y - M.y) * 0.14;
          const na = M.a + (target.a - M.a) * 0.1;
          const moved = Math.abs(nx - M.x) + Math.abs(ny - M.y) + Math.abs(na - M.a);
          M.x = nx;
          M.y = ny;
          M.a = na;
          const sc = big ? 1.6 : dragging ? 0.75 : 1;
          cursorEl.style.transform = `translate3d(${M.x - 36}px, ${M.y - 36}px, 0) scale(${sc})`;
          cursorEl.style.opacity = String(Math.min(1, M.a));
          if (moved > 0.05) paint();
        };
        gsap.ticker.add(tick);
        stopTick = () => {
          gsap.ticker.remove(tick);
          section.removeEventListener("pointermove", onMove);
          section.removeEventListener("pointerleave", onLeave);
          section.removeEventListener("pointerdown", onDown);
          section.removeEventListener("pointerup", onUp);
          section.removeEventListener("pointercancel", onUp);
        };

        gsap.set(intro, { y: 0, opacity: 1 });
        gsap.set(".p-fade", { opacity: 0, y: 14 });
        bar.style.transformOrigin = "0% 50%";
        apply();

        /* ───────── INTRO: scattered letters assemble as the section scrolls in ───────── */
        const chars = Array.from(intro.querySelectorAll<HTMLElement>(".ic"));
        const rnd = (i: number, s: number) => {
          const r = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
          return r - Math.floor(r);
        };
        chars.forEach((c, i) => {
          gsap.set(c, {
            x: (rnd(i, 1) - 0.5) * vw * 0.55,
            y: (rnd(i, 2) - 0.25) * vh * 0.55,
            rotation: (rnd(i, 3) - 0.5) * 150,
            scale: 0.45 + rnd(i, 4) * 0.7,
            opacity: 0,
          });
        });
        gsap.set(pill, { scale: 0, rotation: -18, opacity: 0 });

        stick.style.height = `${vh + total}px`;

        const enter = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: stick, start: "top 88%", end: "top 30%", scrub: 0.5, invalidateOnRefresh: true },
        });
        enter.to(chars, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, ease: "power3.out", duration: 1, stagger: { each: 0.014, from: "random" } }, 0);
        enter.to(pill, { scale: 1, rotation: 0, opacity: 1, ease: "back.out(1.7)", duration: 0.5 }, 0.1);

        /* ───────── MAIN: CSS-sticky section + one scrubbed timeline ───────── */
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: apply,
          scrollTrigger: { trigger: stick, start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true },
        });

        // intro leaves FIRST, then the words rise (never overlap)
        // (intro stays fully readable for the first 35% of phase 0)
        tl.to(intro, { y: -vh * 0.14, opacity: 0, ease: "power1.in", duration: p0 * 0.4 }, p0 * 0.35);
        tl.to(S, { rise: 0, ease: "power2.out", duration: p0 * 0.5 }, p0 * 0.5);
        tl.to(S, { u: 1, duration: run }, p0);

        arrows.forEach((a, g) => {
          const path = a.querySelector<SVGPathElement>("path.draw");
          if (!path) return;
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          const t = Math.max(p0, p0 + run * (arrowU[g] ?? 0) - run * 0.04);
          tl.to(path, { strokeDashoffset: 0, ease: "power1.out", duration: run * 0.06 }, t);
        });
        section.querySelectorAll<HTMLElement>(".p-fade").forEach((el) => {
          const w = worldOf(el);
          const u = route.uNear(w.x, w.y, vw / 2, vh / 2);
          const t = Math.max(p0, p0 + run * u - run * 0.05);
          tl.to(el, { opacity: 1, y: 0, ease: "power2.out", duration: run * 0.05 }, t);
        });

        /* stage buttons → scroll positions (camera centred on each word) */
        const st = tl.scrollTrigger;
        const startPx = st ? st.start : 0;
        targetsRef.current = info.map((b, i) => {
          const u = route.uNear(b.left + b.w / 2, b.y + vh / 2, vw / 2, vh / 2);
          void i;
          return Math.round(startPx + introPx + route.total * 0.82 * u);
        });

        gsap.to(".badge-ring", { rotation: 360, svgOrigin: "100 100", duration: 32, repeat: -1, ease: "none" });
      }, section);
    };

    build();

    document.fonts?.ready.then(() => {
      if (disposed) return;
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
      disposed = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
      stopTick?.();
      ctx?.revert();
      ctx = null;
    };
  }, [variant]);

  /* ───────────── compact variant: plain list, no sticky ───────────── */
  if (variant === "compact") {
    return (
      <section style={{ background: BG, color: LIME, padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: "2.5rem" }}>
          {STAGES.map((s, i) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "4rem 1fr", gap: "1.5rem", alignItems: "baseline" }}>
              <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: "0.2em", color: CREAM }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div style={{ fontFamily: '"Anton", sans-serif', fontSize: "clamp(2.5rem,7vw,5rem)", lineHeight: 0.95 }}>{s.word}</div>
                <p style={{ fontFamily: '"Inter", sans-serif', color: CREAM, opacity: 0.8, marginTop: "0.5rem" }}>{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ─────────────────────────── home variant ─────────────────────────── */
  return (
    <div style={{ position: "relative", backgroundColor: BG, visibility: "visible" }}>
      <style>{`
        .p-badge .bi{transition:transform .5s cubic-bezier(.16,1,.3,1);cursor:pointer}
        .p-badge:hover .bi{transform:scale(1.1) rotate(10deg)}
        .p-cta{transition:transform .35s cubic-bezier(.16,1,.3,1)}
        .p-cta:hover{transform:translateY(-4px) scale(1.05)}
        .p-nav{background:none;border:0;padding:.35rem .2rem;cursor:pointer;font:inherit;letter-spacing:inherit;transition:opacity .25s,color .25s}
        .p-nav:hover{opacity:1!important}
        .p-badge,.p-cta{cursor:pointer}
      `}</style>

      {/* curve: ends the Services page */}
      <div aria-hidden="true" style={{ position: "relative", height: "18vh", overflow: "hidden", backgroundColor: BG }}>
        <div style={{ position: "absolute", top: 0, left: "-28%", width: "156%", height: "100%", background: LIME, borderRadius: "0 0 50% 50% / 0 0 100% 100%" }} />
      </div>

      <div ref={stickRef} style={{ position: "relative", height: "500vh" }}>
        <section
          ref={sectionRef}
          id="process"
          style={{
            position: "sticky",
            top: 0,
            width: "100%",
            height: "100vh",
            overflow: "hidden",
            backgroundColor: BG,
            color: LIME,
            cursor: "grab",
            userSelect: "none",
            touchAction: "pan-y",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        >
          {/* cursor follower: DRAG / VIEW / GO / JUMP */}
          <div
            ref={cursorRef}
            aria-hidden="true"
            style={{ position: "absolute", left: 0, top: 0, width: 72, height: 72, borderRadius: "50%", border: `1.5px solid ${LIME}`, zIndex: 20, pointerEvents: "none", opacity: 0, display: "grid", placeItems: "center", willChange: "transform" }}
          >
            <span ref={cursorLabelRef} style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.2em", color: LIME }}>
              DRAG
            </span>
          </div>

          {/* intro */}
          <div
            ref={introRef}
            style={{
              position: "absolute",
              top: "20vh",
              left: 0,
              right: 0,
              zIndex: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.3rem",
              padding: "0 1.5rem",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <span
              ref={pillRef}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "0.45rem 0.9rem", borderRadius: 8, background: LIME, color: BG, fontFamily: '"Anton", sans-serif', fontSize: "0.8rem", letterSpacing: "0.12em" }}
            >
              <span aria-hidden="true" style={{ display: "grid", gap: 2 }}>
                <i style={{ width: 3, height: 3, borderRadius: "50%", background: BG, display: "block" }} />
                <i style={{ width: 3, height: 3, borderRadius: "50%", background: BG, display: "block" }} />
                <i style={{ width: 3, height: 3, borderRadius: "50%", background: BG, display: "block" }} />
              </span>
              HOW WE WORK
            </span>
            <h2
              aria-label="We’re here for the founders who ship."
              style={{ margin: 0, fontFamily: '"Anton", sans-serif', fontWeight: 400, textTransform: "uppercase", lineHeight: 0.94, letterSpacing: "-0.01em", fontSize: "clamp(2.2rem, 6vw, 5.2rem)" }}
            >
              {INTRO_LINES.map((line) => (
                <div key={line}>
                  <Letters text={line} className="ic" />
                </div>
              ))}
            </h2>
          </div>

          {/* world */}
          <div ref={trackRef} style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, willChange: "transform", zIndex: 3 }}>
            {STAGES.map((s) => (
              <div
                key={s.id}
                data-block
                data-name={s.id.toUpperCase()}
                style={{ position: "absolute", left: 0, top: 0, height: "100vh", display: "flex", alignItems: "center", padding: "0 4vw", transformOrigin: "50% 50%" }}
              >
                <span
                  aria-label={s.word}
                  style={{ fontFamily: '"Anton", sans-serif', fontSize: "min(40vh, 58vw)", lineHeight: 0.82, letterSpacing: "-0.01em", whiteSpace: "nowrap", color: LIME, userSelect: "none" }}
                >
                  <Letters text={s.word} className="wl" />
                </span>

                {/* SVG badge (hover + cursor parallax) */}
                <div
                  className="p-badge"
                  data-cursor="VIEW"
                  data-depth="0.16"
                  data-rot={s.badgePos.rot}
                  style={{ position: "absolute", left: `${s.badgePos.x}%`, top: `${s.badgePos.y}vh`, width: v(s.badgePos.size), aspectRatio: "1 / 1", zIndex: 5 }}
                >
                  <div className="bi" style={{ width: "100%", height: "100%" }}>
                    <Badge stage={s} />
                  </div>
                </div>

                {/* SVG burst */}
                <div
                  aria-hidden="true"
                  data-depth="0.3"
                  data-rot={s.burst.rot}
                  style={{ position: "absolute", left: `${s.burst.x}%`, top: `${s.burst.y}vh`, width: v(s.burst.size), aspectRatio: "1 / 1", zIndex: 4, pointerEvents: "none" }}
                >
                  <Burst />
                </div>

                {/* handwritten note */}
                <div
                  className="p-fade"
                  style={{ position: "absolute", left: `${s.notePos.x}%`, top: `${s.notePos.y}vh`, zIndex: 5, display: "flex", gap: "0.6rem", alignItems: "flex-start", maxWidth: "17ch", color: CREAM, pointerEvents: "none" }}
                >
                  <svg width="22" height="30" viewBox="0 0 22 30" aria-hidden="true" style={{ flex: "none", opacity: 0.8 }}>
                    <path d="M2 2 V28 M2 28 H20" fill="none" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontFamily: '"Caveat","Segoe Script",cursive', fontSize: "clamp(1.1rem,1.7vw,1.5rem)", lineHeight: 1.05, transform: "rotate(-3deg)" }}>{s.note}</span>
                </div>

                {s.cta && (
                  <a
                    href="/contact"
                    className="p-fade p-cta"
                    data-cursor="GO"
                    style={{ position: "absolute", right: "4vw", bottom: "9vh", zIndex: 7, display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "1rem 1.6rem", borderRadius: 999, background: LIME, color: BG, fontFamily: '"Anton", sans-serif', fontSize: "1rem", letterSpacing: "0.1em", textDecoration: "none" }}
                  >
                    START YOUR PROJECT ↗
                  </a>
                )}
              </div>
            ))}

            {STAGES.slice(0, -1).map((s) => (
              <div key={`arrow-${s.id}`} className="p-arrow" style={{ position: "absolute", zIndex: 5, pointerEvents: "none" }}>
                <Arrow />
              </div>
            ))}
          </div>

          {/* stage buttons (click → smooth scroll to that word) */}
          <nav
            aria-label="Process stages"
            style={{ position: "absolute", left: "2rem", bottom: "1.6rem", zIndex: 9, display: "flex", alignItems: "center", gap: "1.1rem", fontFamily: '"Inter", system-ui, sans-serif', fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", color: CREAM }}
          >
            {STAGES.map((s, i) => (
              <button key={s.id} className="p-nav" data-cursor="JUMP" type="button" onClick={() => go(i)} style={{ opacity: i === 0 ? 1 : 0.42, color: i === 0 ? LIME : CREAM }}>
                {String(i + 1).padStart(2, "0")} {s.id.toUpperCase()}
              </button>
            ))}
          </nav>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, background: "rgba(239,235,224,0.12)", zIndex: 9 }}>
            <div ref={barRef} style={{ width: "100%", height: "100%", background: LIME, transform: "scaleX(0)" }} />
          </div>
        </section>
      </div>
    </div>
  );
}