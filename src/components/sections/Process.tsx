"use client";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   PROCESS — "TO DISCOVER → TO DESIGN → TO BUILD → TO LAUNCH"
   Dark (#0B0B0C) + lime (#D2FF00). Place AFTER <Services />.

   v3
   • ARROWS  : curly, generated INSIDE the empty gap between two words
               (x-range clamped) → can never cross the big text.
   • NOTES   : 3 unique notes per stage (handwritten + sticky paper).
   • PERF    : everything sleeps unless the section is near the viewport
               (IntersectionObserver). Ticker, badge-ring spin, cursor,
               per-letter layers are all gated. No page-wide side effects:
               wrapper is `isolation:isolate` + section is `contain:paint`.
   • SMOOTH  : one damped scroll value drives every visual, so forward
               and reverse play the exact same frames.
   Fonts: Anton, Inter, Caveat.
   ═══════════════════════════════════════════════════════════════ */

const LIME = "#D2FF00";
const BG = "#0B0B0C";
const CREAM = "#EFEBE0";

type Note = {
  kind: "hand" | "sticky";
  text: string;
  title?: string;
  /* x = % of word block width · y = vh · rot = deg */
  x: number;
  y: number;
  rot: number;
};

type Stage = {
  id: string;
  word: string;
  badge: { label: string; sub: string; ring: string; tone: "lime" | "cream" | "ink" };
  notes: Note[];
  badgePos: { x: number; y: number; rot: number; size: number };
  burst: { x: number; y: number; rot: number; size: number };
  cta?: boolean;
};

const v = (n: number) => `min(${n}vh, ${(n * 1.15).toFixed(2)}vw)`;

/* notes live only in the free bands: top y 13–26vh (below the site header),
   bottom y 74–90vh (above the stage nav). Never over the big word. */
export const STAGES: Stage[] = [
  {
    id: "discover",
    word: "TO DISCOVER",
    badge: { label: "DISCOVER", sub: "2 HRS", ring: "FREE DISCOVERY CALL · NO PITCH DECKS · JUST FOUNDERS · ", tone: "lime" },
    badgePos: { x: 64, y: 6, rot: 8, size: 32 },
    burst: { x: 22, y: 12, rot: 12, size: 11 },
    notes: [
      { kind: "hand", text: "one meet or call. every requirement captured.", x: 5, y: 76, rot: -3 },
      { kind: "sticky", title: "FREE DEMO", text: "a working prototype within 2 hrs — before the deal is signed.", x: 36, y: 75, rot: 2.5 },
      { kind: "hand", text: "no deal yet. just proof.", x: 40, y: 14, rot: -4 },
    ],
  },
  {
    id: "design",
    word: "TO DESIGN",
    badge: { label: "DESIGN", sub: "FIGMA", ring: "BRAND · UI · MOTION · PROTOTYPES · SYSTEMS · ", tone: "cream" },
    badgePos: { x: 18, y: 58, rot: -10, size: 30 },
    burst: { x: 78, y: 14, rot: -8, size: 12 },
    notes: [
      { kind: "hand", text: "deal done. now we design it right.", x: 62, y: 77, rot: -3 },
      { kind: "sticky", title: "SCHEMA + FLOWS", text: "screen flows & database schema planned before any code.", x: 30, y: 13, rot: -3 },
      { kind: "hand", text: "high-level website architecture first.", x: 6, y: 14, rot: -2 },
    ],
  },
  {
    id: "build",
    word: "TO BUILD",
    badge: { label: "BUILD", sub: "NEXT.JS", ring: "NEXT.JS · REACT · GSAP · TYPESCRIPT · SHIPPED CLEAN · ", tone: "ink" },
    badgePos: { x: 68, y: 60, rot: 6, size: 32 },
    burst: { x: 16, y: 16, rot: 20, size: 11 },
    notes: [
      { kind: "hand", text: "now the coding begins.", x: 36, y: 14, rot: -3 },
      { kind: "sticky", title: "BUILD + TEST", text: "we code, test every feature & fix it before you see it.", x: 6, y: 75, rot: -2 },
      { kind: "hand", text: "small updates shared along the way.", x: 38, y: 80, rot: 2 },
    ],
  },
  {
    id: "launch",
    word: "TO LAUNCH",
    badge: { label: "LAUNCH", sub: "DAY ONE", ring: "LIVE IN WEEKS · NOT MONTHS · FOUNDERS WHO SHIP · ", tone: "lime" },
    badgePos: { x: 58, y: 8, rot: -8, size: 34 },
    burst: { x: 14, y: 62, rot: 10, size: 12 },
    cta: true,
    notes: [
      { kind: "hand", text: "deployed. production-ready.", x: 6, y: 78, rot: -3 },
      { kind: "sticky", title: "ON DEADLINE", text: "no fixed timeline — it depends on your project. delivered by the agreed date.", x: 30, y: 75, rot: 2 },
      { kind: "hand", text: "we deploy & hand over the documents.", x: 7, y: 14, rot: -4 },
    ],
  },
];

const INTRO_LINES = ["WE’RE HERE FOR", "THE FOUNDERS", "WHO SHIP."];

const TONES = {
  lime: { bg: LIME, fg: "#0B0B0C" },
  cream: { bg: CREAM, fg: "#0B0B0C" },
  ink: { bg: "#17171A", fg: LIME },
};

/* per-gap arrow personality: S-wave, little loop, S-wave (mirrored) */
const ARROW_CFG = [
  { a: 0.55, h1: 0.7, h2: -0.5 },
  { a: 1.2, h1: -0.5, h2: -0.5 },
  { a: 0.55, h1: -0.7, h2: 0.5 },
];

/* ───────── tiny math helpers ───────── */
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOut3 = (t: number) => 1 - (1 - t) ** 3;
const easeOut2 = (t: number) => 1 - (1 - t) ** 2;
const easeIn2 = (t: number) => t * t;
const easeInOut3 = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};
const rnd = (i: number, s: number) => {
  const r = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return r - Math.floor(r);
};

type Pt = { x: number; y: number };
type ArrowCfg = { a: number; h1: number; h2: number };

/* Curly arrow from A to B that is forced to stay inside the empty gap between two words
   (x ∈ [xMin, xMax]). Lateral curl is shrunk until it fits, so it can never touch the text. */
function curlyArrow(A: Pt, B: Pt, xMin: number, xMax: number, cfg: ArrowCfg, head: number) {
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const L = Math.hypot(dx, dy) || 1;
  const d = { x: dx / L, y: dy / L };
  const n = { x: -d.y, y: d.x };
  const N = 72;
  const sample = (k: number) => {
    const c1 = { x: A.x + d.x * L * cfg.a + n.x * L * cfg.h1 * k, y: A.y + d.y * L * cfg.a + n.y * L * cfg.h1 * k };
    const c2 = { x: B.x - d.x * L * cfg.a + n.x * L * cfg.h2 * k, y: B.y - d.y * L * cfg.a + n.y * L * cfg.h2 * k };
    const out: Pt[] = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const u = 1 - t;
      const w0 = u * u * u;
      const w1 = 3 * u * u * t;
      const w2 = 3 * u * t * t;
      const w3 = t * t * t;
      out.push({ x: w0 * A.x + w1 * c1.x + w2 * c2.x + w3 * B.x, y: w0 * A.y + w1 * c1.y + w2 * c2.y + w3 * B.y });
    }
    return out;
  };
  const headOf = (pts: Pt[]) => {
    const e = pts[pts.length - 1]!;
    const q = pts[pts.length - 7]!;
    const ang = Math.atan2(e.y - q.y, e.x - q.x) + Math.PI;
    return [
      { x: e.x + head * Math.cos(ang + 0.5), y: e.y + head * Math.sin(ang + 0.5) },
      { x: e.x + head * Math.cos(ang - 0.5), y: e.y + head * Math.sin(ang - 0.5) },
    ] as [Pt, Pt];
  };
  const fits = (pts: Pt[], hd: Pt[]) => [...pts, ...hd].every((p) => p.x >= xMin && p.x <= xMax);
  let k = 1;
  let pts = sample(k);
  let hd = headOf(pts);
  for (let i = 0; i < 30 && !fits(pts, hd); i++) {
    k *= 0.9;
    pts = sample(k);
    hd = headOf(pts);
  }
  return { pts, head: hd };
}


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

/* Arrow: path `d`, size and viewBox are written in the effect */
function Arrow() {
  return (
    <svg className="a-svg" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible", display: "block" }}>
      <path className="draw" d="" fill="none" stroke={LIME} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NoteView({ n }: { n: Note }) {
  if (n.kind === "sticky") {
    return (
      <div
        className="p-fade"
        style={{
          position: "absolute",
          left: `${n.x}%`,
          top: `${n.y}vh`,
          zIndex: 5,
          width: "clamp(170px, 15vw, 245px)",
          padding: "0.9rem 0.95rem 0.8rem",
          background: CREAM,
          color: BG,
          borderRadius: 3,
          boxShadow: "0 12px 26px rgba(0,0,0,0.5), 0 2px 0 rgba(0,0,0,0.25)",
          transform: `rotate(${n.rot}deg)`,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <i aria-hidden="true" style={{ position: "absolute", top: -9, left: "50%", width: 56, height: 16, marginLeft: -28, background: "rgba(210,255,0,0.88)", transform: "rotate(-3deg)", display: "block" }} />
        <b style={{ display: "block", fontFamily: '"Inter", system-ui, sans-serif', fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.22em", marginBottom: "0.4rem" }}>{n.title}</b>
        <span style={{ display: "block", fontFamily: '"Caveat","Segoe Script",cursive', fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)", lineHeight: 1.05, color: "#17171A" }}>{n.text}</span>
      </div>
    );
  }
  return (
    <div
      className="p-fade"
      style={{ position: "absolute", left: `${n.x}%`, top: `${n.y}vh`, zIndex: 5, display: "flex", gap: "0.6rem", alignItems: "flex-start", maxWidth: "22ch", color: CREAM, pointerEvents: "none", opacity: 0 }}
    >
      <svg width="22" height="30" viewBox="0 0 22 30" aria-hidden="true" style={{ flex: "none", opacity: 0.8 }}>
        <path d="M2 2 V28 M2 28 H20" fill="none" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: '"Caveat","Segoe Script",cursive', fontSize: "clamp(1.1rem,1.7vw,1.5rem)", lineHeight: 1.05, transform: `rotate(${n.rot}deg)`, display: "block" }}>{n.text}</span>
    </div>
  );
}

/* ═════════════ curved route (Hermite spline + arc-length table) ═════════════ */
type V = { x: number; y: number };
type LutPt = V & { l: number };

const SAMPLES = 48;

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
    for (let k = 0; k < SAMPLES; k++) {
      const t = k / SAMPLES;
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
    const target = clamp01(u) * total;
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

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`;

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
  const [reduced, setReduced] = useState(false);

  const go = (i: number) => {
    const stick = stickRef.current;
    const off = targetsRef.current[i];
    if (!stick || off === undefined) return;
    const top = stick.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.round(top + off), behavior: "smooth" });
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

    /* reduced motion → static compact list (no sticky, no scroll hijack) */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }

    let ctx: gsap.Context | null = null;
    let disposed = false;
    let stopTick: (() => void) | null = null;
    let activate: ((on: boolean) => void) | null = null;
    let active = true; // updated by IntersectionObserver
    let lastW = window.innerWidth;
    let lastH = stick.offsetHeight;
    let sig: number[] = [];

    const build = () => {
      if (disposed) return;
      stopTick?.();
      ctx?.revert();
      let needRefresh = false;
      ctx = gsap.context(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        lastW = vw;

        /* ───────── world layout: each word on its own zig-zag row ───────── */
        const blocks = Array.from(track.querySelectorAll<HTMLElement>("[data-block]"));
        const rowY = [0, 0.5, -0.1, 0.44];
        const tilt = [-2, 2.5, -2.5, 2];
        const padX = vw * 0.04; // = block padding "0 4vw"
        const gap = vw * 0.4; // wide empty gap → room for the curly arrow
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
        sig = info.map((b) => b.w);

        const pts: V[] = [];
        info.forEach(({ left, right, y }) => {
          const sx = left - vw * 0.06;
          pts.push({ x: sx, y });
          pts.push({ x: Math.max(sx + 1, right - vw * 0.94), y });
        });
        const route = buildRoute(pts);
        const cam0 = pts[0]!;

        const introPx = vh * 1.1;
        const routePx = route.total * 0.82;
        const holdPx = vh * 0.4; // final beat: CTA stays readable before the section unpins
        const total = introPx + routePx + holdPx;
        const newH = vh + total;
        stick.style.height = `${newH}px`;
        if (Math.abs(newH - lastH) > 1) {
          lastH = newH;
          needRefresh = true;
        }

        /* ───────── camera pacing: slow down (dwell) when a word is centred ─────────
           q = scroll progress along the route (linear) → u = position on the route (eased) */
        const uc = info.map((b) => route.uNear(b.left + b.w / 2, b.y + vh / 2, vw / 2, vh / 2));
        const DN = 600;
        const cum = new Float32Array(DN + 1);
        for (let k = 1; k <= DN; k++) {
          const uu = (k - 0.5) / DN;
          let dm = 1;
          for (const c of uc) dm = Math.min(dm, Math.abs(uu - c));
          const sm = clamp01(dm / 0.075);
          const f = 0.5 + 0.5 * (sm * sm * (3 - 2 * sm)); // 0.5× speed on a word, 1× in the gaps
          cum[k] = cum[k - 1]! + 1 / f;
        }
        const cumTot = cum[DN]!;
        for (let k = 0; k <= DN; k++) cum[k] = cum[k]! / cumTot;
        const uOfQ = (q: number) => {
          if (q <= 0) return 0;
          if (q >= 1) return 1;
          let lo = 0;
          let hi = DN;
          while (hi - lo > 1) {
            const m = (lo + hi) >> 1;
            if (cum[m]! < q) lo = m;
            else hi = m;
          }
          const a0 = cum[lo]!;
          const b0 = cum[hi]!;
          return (lo + (b0 === a0 ? 0 : (q - a0) / (b0 - a0))) / DN;
        };
        const qOfU = (uu: number) => {
          const x = clamp01(uu) * DN;
          const lo = Math.floor(x);
          const hi = Math.min(DN, lo + 1);
          return cum[lo]! + (cum[hi]! - cum[lo]!) * (x - lo);
        };

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
            mag: el.classList.contains("p-badge"),
            wx: w.x,
            wy: w.y,
          };
        });
        const letters = Array.from(track.querySelectorAll<HTMLElement>(".wl")).map((el) => {
          const b = el.closest<HTMLElement>("[data-block]")!;
          return { el, lx: b.offsetLeft + el.offsetLeft + el.offsetWidth / 2, on: false, s: "" };
        });
        const navBtns = Array.from(section.querySelectorAll<HTMLElement>(".p-nav"));

        /* badge ring spin: one paused tween per badge, only the on-screen ones run */
        const badges = par.filter((p) => p.mag);
        const rings = Array.from(section.querySelectorAll<SVGGElement>(".badge-ring")).map((g) =>
          gsap.to(g, { rotation: 360, svgOrigin: "100 100", duration: 32, repeat: -1, ease: "none", paused: true })
        );
        const ringOn: boolean[] = rings.map(() => false);

        /* ───────── ARROWS: curly, clamped inside the gap between two words ───────── */
        const arrows = Array.from(section.querySelectorAll<HTMLElement>(".p-arrow")).map((a, g) => {
          const i0 = info[g]!;
          const i1 = info[g + 1]!;
          const svg = a.querySelector<SVGSVGElement>("svg.a-svg");
          const path = a.querySelector<SVGPathElement>("path.draw");
          const gR = i0.right - padX; // right edge of word g (glyphs)
          const gL = i1.left + padX; // left edge of word g+1
          const sin0 = Math.sin((((tilt[g] ?? 0) * Math.PI) / 180));
          const sin1 = Math.sin((((tilt[g + 1] ?? 0) * Math.PI) / 180));
          const yR = i0.y + vh / 2 + (i0.w / 2) * sin0; // word g right edge, mid-height
          const yL = i1.y + vh / 2 - (i1.w / 2) * sin1; // word g+1 left edge, mid-height
          const A: V = { x: gR + vw * 0.035, y: yR + (yL - yR) * 0.2 };
          const B: V = { x: gL - vw * 0.04, y: yL - (yL - yR) * 0.2 };
          const cfg = ARROW_CFG[g % ARROW_CFG.length]!;
          const r = curlyArrow(A, B, gR + vw * 0.012, gL - vw * 0.012, cfg, Math.min(vh, vw) * 0.04);
          const e = r.pts[r.pts.length - 1]!;
          const all = [...r.pts, ...r.head];
          const pad = 14;
          const minX = Math.min(...all.map((p) => p.x)) - pad;
          const minY = Math.min(...all.map((p) => p.y)) - pad;
          const W = Math.max(...all.map((p) => p.x)) + pad - minX;
          const H = Math.max(...all.map((p) => p.y)) + pad - minY;
          a.style.left = `${minX}px`;
          a.style.top = `${minY}px`;
          a.style.width = `${W}px`;
          a.style.height = `${H}px`;
          svg?.setAttribute("viewBox", `0 0 ${W} ${H}`);
          svg?.setAttribute("preserveAspectRatio", "none");
          const f = (p: V) => `${(p.x - minX).toFixed(1)} ${(p.y - minY).toFixed(1)}`;
          const d = `M${f(r.pts[0]!)} ` + r.pts.slice(1).map((p) => `L${f(p)}`).join(" ") + ` M${f(r.head[0])} L${f(e)} L${f(r.head[1])}`;
          path?.setAttribute("d", d);
          const len = path ? path.getTotalLength() : 0;
          if (path) {
            path.style.strokeDasharray = `${len}`;
            path.style.strokeDashoffset = `${len}`;
          }
          const s0 = route.segStart[2 * g + 1] ?? 0;
          const s1 = route.segStart[2 * g + 2] ?? s0 + 1;
          return { path, len, u0: route.lut[s0]!.l / route.total, u1: route.lut[s1]!.l / route.total, g: -1 };
        });

        /* notes + CTA fade in as the camera reaches them */
        const fades = Array.from(section.querySelectorAll<HTMLElement>(".p-fade")).map((el) => {
          const w = worldOf(el);
          const u = route.uNear(w.x, w.y, vw / 2, vh / 2);
          el.style.opacity = "0";
          return { el, u0: Math.max(0, u - 0.07), t: -1 };
        });

        /* intro characters (scattered start state, deterministic) */
        const chars = Array.from(intro.querySelectorAll<HTMLElement>(".ic")).map((el, i) => ({
          el,
          x: (rnd(i, 1) - 0.5) * vw * 0.55,
          y: (rnd(i, 2) - 0.25) * vh * 0.55,
          r: (rnd(i, 3) - 0.5) * 150,
          s: 0.45 + rnd(i, 4) * 0.7,
          d: rnd(i, 5) * 0.45,
        }));

        targetsRef.current = uc.map((c) => Math.round(introPx + routePx * qOfU(c)));

        track.style.visibility = "visible";

        /* ───────── state ───────── */
        const M = { x: vw / 2, y: vh / 2, a: 0 };
        const target = { x: vw / 2, y: vh / 2, a: 0 };
        let cam: V = { ...cam0 };
        let u = 0;
        let rise = vh * 0.58;
        let activeStage = -1;
        let lastEnter = -1;
        let running = false;
        let lead = 0; // scroll velocity proxy −1..1 → letters lean into the motion
        let wasMoving = false;

        const rawRel = () => -stick.getBoundingClientRect().top;
        let relS = rawRel();

        /* parallax + letter lift (camera AND cursor) — only touches what is on screen */
        const paint = () => {
          const mx = (M.x / vw - 0.5) * 2 * M.a;
          const my = (M.y / vh - 0.5) * 2 * M.a;
          for (const p of par) {
            const wsx = p.wx - cam.x;
            if (wsx < -vw * 0.9 || wsx > vw * 1.9) continue;
            /* offset is relative to the element's own screen position → zero when centred,
               small at the edges, never accumulates across the whole route */
            const relY = p.wy - cam.y + rise - vh / 2;
            let px = (wsx - vw / 2) * p.depth * 0.5 + mx * p.depth * 90;
            let py = relY * p.depth * 0.5 + my * p.depth * 90;
            if (p.mag && M.a > 0.01) {
              const sx = wsx + px;
              const sy = p.wy - cam.y + rise + py;
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
            p.el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) rotate(${(p.rot + (u * 8 - 4)).toFixed(1)}deg)`;
          }
          for (const l of letters) {
            const sx = l.lx - cam.x;
            const inView = sx > -vw * 0.4 && sx < vw * 1.4;
            if (!inView) {
              if (l.on) {
                l.on = false;
                l.el.style.willChange = "auto"; // free the GPU layer when far away
              }
              continue;
            }
            if (!l.on) {
              l.on = true;
              l.el.style.willChange = "transform";
            }
            const nx = sx / vw - 0.5;
            const rot = -nx * 5;
            const sag = nx * nx * vh * 0.07;
            const d = Math.abs(sx - M.x) / vw;
            const lift = d < 0.13 ? (1 - d / 0.13) ** 2 * vh * 0.05 * M.a : 0;
            const str = `translate3d(0, ${(sag - lift).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) skewX(${(-lead * 5).toFixed(2)}deg)`;
            if (str !== l.s) {
              l.s = str;
              l.el.style.transform = str;
            }
          }
        };

        /* everything that depends on scroll */
        const render = () => {
          /* phase A: intro letters assemble (stick top 40% → 0) */
          const eP = clamp01((relS + vh * 0.5) / (vh * 0.5));
          if (eP !== lastEnter) {
            lastEnter = eP;
            for (const c of chars) {
              const t = easeOut3(clamp01((eP - c.d) / (1 - 0.45)));
              const k = 1 - t;
              c.el.style.opacity = String(clamp01(t * 2));
              c.el.style.transform = `translate3d(${(c.x * k).toFixed(1)}px, ${(c.y * k).toFixed(1)}px, 0) rotate(${(c.r * k).toFixed(1)}deg) scale(${(c.s + (1 - c.s) * t).toFixed(3)})`;
            }
            const pt = clamp01((eP - 0.1) / 0.5);
            const ps = easeBack(pt);
            pill.style.opacity = String(clamp01(pt * 2));
            pill.style.transform = `scale(${ps.toFixed(3)}) rotate(${(-18 * (1 - ps)).toFixed(2)}deg)`;
          }

          /* phase B: intro leaves, first word rises */
          const px = Math.min(total, Math.max(0, relS));
          const a = clamp01(px / introPx);
          intro.style.opacity = String(1 - easeIn2(clamp01((a - 0.16) / 0.4)));
          intro.style.transform = `translate3d(0, ${(-vh * 0.3 * easeIn2(clamp01((a - 0.06) / 0.6))).toFixed(1)}px, 0)`;
          rise = vh * 0.58 * (1 - easeInOut3(clamp01((a - 0.24) / 0.76)));

          /* phase C: camera rides the route */
          u = uOfQ((px - introPx) / routePx);
          cam = route.pos(u);
          track.style.transform = `translate3d(${(-cam.x).toFixed(1)}px, ${(-cam.y + rise).toFixed(1)}px, 0)`;
          bar.style.transform = `scaleX(${u.toFixed(4)})`;

          for (const ar of arrows) {
            if (!ar.path) continue;
            const span = ar.u1 - ar.u0;
            const g = clamp01((u - ar.u0 - span * 0.03) / (span * 0.6));
            if (g === ar.g) continue;
            ar.g = g;
            ar.path.style.strokeDashoffset = (ar.len * (1 - easeOut2(g))).toFixed(1);
          }
          for (const f of fades) {
            const t = clamp01((u - f.u0) / 0.05);
            if (t === f.t) continue;
            f.t = t;
            const e = easeOut2(t);
            f.el.style.opacity = e.toFixed(3);
            f.el.style.translate = `0 ${(14 * (1 - e)).toFixed(1)}px`;
            f.el.style.scale = (0.9 + 0.1 * e).toFixed(3);
          }

          badges.forEach((b, i) => {
            const sx = b.wx - cam.x;
            const on = sx > -vw * 0.45 && sx < vw * 1.2;
            if (on !== ringOn[i]) {
              ringOn[i] = on;
              if (on) rings[i]?.resume();
              else rings[i]?.pause();
            }
          });

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
          paint();
        };

        /* ───────── cursor follower + drag-to-scroll ───────── */
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
        section.addEventListener("pointermove", onMove, { passive: true });
        section.addEventListener("pointerleave", onLeave);
        section.addEventListener("pointerdown", onDown);
        section.addEventListener("pointerup", onUp);
        section.addEventListener("pointercancel", onUp);

        /* ───────── the ONE ticker (only alive while the section is near the viewport) ───────── */
        const tick = (_time: number, deltaMs: number) => {
          const dt = Math.min(deltaMs, 64) / 1000;

          const rel = rawRel();
          const dS = rel - relS;
          const moved = Math.abs(dS) > 0.08;
          relS = moved ? relS + dS * (1 - Math.exp(-dt * 10)) : rel;
          lead = moved ? Math.max(-1, Math.min(1, dS / (vh * 0.3))) : 0;

          const kc = 1 - Math.exp(-dt * 9);
          const ka = 1 - Math.exp(-dt * 6);
          const nx = M.x + (target.x - M.x) * kc;
          const ny = M.y + (target.y - M.y) * kc;
          const na = M.a + (target.a - M.a) * ka;
          const cMoved = Math.abs(nx - M.x) + Math.abs(ny - M.y) + Math.abs(na - M.a) > 0.04;
          M.x = nx;
          M.y = ny;
          M.a = na;

          if (cMoved || target.a > 0 || M.a > 0.01) {
            const sc = big ? 1.6 : dragging ? 0.75 : 1;
            cursorEl.style.transform = `translate3d(${(M.x - 36).toFixed(1)}px, ${(M.y - 36).toFixed(1)}px, 0) scale(${sc})`;
            cursorEl.style.opacity = Math.min(1, M.a).toFixed(2);
          }

          if (moved || wasMoving) render();
          else if (cMoved) paint();
          wasMoving = moved;
        };

        activate = (on: boolean) => {
          if (on === running) return;
          running = on;
          if (on) {
            relS = rawRel();
            lastEnter = -1;
            gsap.ticker.add(tick);
            render();
          } else {
            gsap.ticker.remove(tick);
            rings.forEach((r) => r.pause());
            ringOn.fill(false);
          }
        };
        stopTick = () => {
          gsap.ticker.remove(tick);
          running = false;
          section.removeEventListener("pointermove", onMove);
          section.removeEventListener("pointerleave", onLeave);
          section.removeEventListener("pointerdown", onDown);
          section.removeEventListener("pointerup", onUp);
          section.removeEventListener("pointercancel", onUp);
        };

        bar.style.transformOrigin = "0% 50%";
        lastEnter = -1;
        render(); // paint first frame even if asleep
        activate(active);
      }, section);

      /* our wrapper height changed → let OTHER ScrollTriggers re-measure (once, only if needed) */
      if (needRefresh) requestAnimationFrame(() => !disposed && ScrollTrigger.refresh());
    };

    /* sleep when far from the viewport: no ticker, no ring spin, no rect reads */
    const io = new IntersectionObserver(
      ([entry]) => {
        active = !!entry?.isIntersecting;
        activate?.(active);
      },
      { rootMargin: "60% 0px 60% 0px" }
    );
    io.observe(stick);

    /* rebuild when font swap changes word widths (no flash: track hidden until first build) */
    let rt: number | undefined;
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            const bl = Array.from(track.querySelectorAll<HTMLElement>("[data-block]"));
            if (!sig.length || !bl.some((b, i) => Math.abs(b.offsetWidth - (sig[i] ?? 0)) > 2)) return;
            window.clearTimeout(rt);
            rt = window.setTimeout(build, 120);
          })
        : null;

    const start = () => {
      if (disposed) return;
      build();
      track.querySelectorAll<HTMLElement>("[data-block]").forEach((b) => ro?.observe(b));
    };
    const fonts = document.fonts;
    if (fonts) {
      Promise.all([fonts.ready, fonts.load('40px "Anton"').catch(() => null)]).then(start, start);
    } else {
      start();
    }

    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        /* ignore mobile address-bar height jitter */
        if (Math.abs(window.innerWidth - lastW) < 2 && window.innerWidth < 900) return;
        build();
      }, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
      window.clearTimeout(rt);
      io.disconnect();
      ro?.disconnect();
      stopTick?.();
      ctx?.revert();
      ctx = null;
    };
  }, [variant]);

  /* ───────────── compact variant (also reduced-motion): plain list, no sticky ───────────── */
  if (variant === "compact" || reduced) {
    return (
      <section data-nav-theme="dark" style={{ background: BG, color: LIME, padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: "2.5rem" }}>
          {STAGES.map((s, i) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "4rem 1fr", gap: "1.5rem", alignItems: "baseline" }}>
              <span style={{ fontFamily: '"Inter", sans-serif', fontWeight: 700, letterSpacing: "0.2em", color: CREAM }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div style={{ fontFamily: '"Anton", sans-serif', fontSize: "clamp(2.5rem,7vw,5rem)", lineHeight: 0.95 }}>{s.word}</div>
                <p style={{ fontFamily: '"Inter", sans-serif', color: CREAM, opacity: 0.8, marginTop: "0.5rem" }}>{s.notes[0]?.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ─────────────────────────── home variant ─────────────────────────── */
  return (
    <div data-nav-theme="dark" style={{ position: "relative", backgroundColor: BG, visibility: "visible", isolation: "isolate" }}>
      <style>{`
        .p-badge .bi{transition:transform .5s cubic-bezier(.16,1,.3,1);cursor:pointer}
        .p-badge:hover .bi{transform:scale(1.1) rotate(10deg)}
        .p-cta{transition:transform .35s cubic-bezier(.16,1,.3,1)}
        .p-cta:hover{transform:translateY(-4px) scale(1.05)}
        .p-nav{background:none;border:0;padding:.35rem .2rem;cursor:pointer;font:inherit;letter-spacing:inherit;transition:opacity .25s,color .25s}
        .p-nav:hover{opacity:1!important}
        .p-badge,.p-cta{cursor:pointer}
        .ic{opacity:0}
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
            contain: "paint",
            backgroundColor: BG,
            color: LIME,
            cursor: "grab",
            userSelect: "none",
            touchAction: "pan-y",
          }}
        >
          {/* film grain on its own static layer (no repaint while scrolling) */}
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: NOISE, transform: "translateZ(0)" }} />

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
              willChange: "transform, opacity",
            }}
          >
            <span
              ref={pillRef}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "0.45rem 0.9rem", borderRadius: 8, background: LIME, color: BG, fontFamily: '"Anton", sans-serif', fontSize: "0.8rem", letterSpacing: "0.12em", opacity: 0 }}
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

          {/* world (hidden until the first build has laid the words out) */}
          <div ref={trackRef} style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, willChange: "transform", zIndex: 3, visibility: "hidden" }}>
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

                {/* 3 unique notes per stage */}
                {s.notes.map((n, k) => (
                  <NoteView key={`${s.id}-n${k}`} n={n} />
                ))}

                {s.cta && (
                  <a
                    href="/contact"
                    className="p-fade p-cta"
                    data-cursor="GO"
                    style={{ position: "absolute", right: "4vw", bottom: "9vh", zIndex: 7, display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "1rem 1.6rem", borderRadius: 999, background: LIME, color: BG, fontFamily: '"Anton", sans-serif', fontSize: "1rem", letterSpacing: "0.1em", textDecoration: "none", opacity: 0 }}
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
            style={{ position: "absolute", left: "1.6rem", bottom: "1.3rem", zIndex: 9, display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.15rem 0.9rem", borderRadius: 999, background: "rgba(11,11,12,0.9)", border: "1px solid rgba(239,235,224,0.12)", fontFamily: '"Inter", system-ui, sans-serif', fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", color: CREAM }}
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