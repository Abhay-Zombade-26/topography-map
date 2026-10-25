"use client";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   TEAM SHOWCASE  (rendered by About.tsx → <About showTeam />)

   "THE CREW REEL" — one pinned scroll story, fully reversible:

     0  HOLD      giant ALTIMA CREW assembles letter by letter
     1  CURTAIN   headline glides to the top-left while 7 lime
                  slabs rise from the floor and are "developed"
                  into portraits (lime wipes away, photo settles)
     2  SWEEP     the spotlight travels across the crew: each
                  member opens up in turn (name · role · LinkedIn)
     3  LINEUP    everyone settles into one full-width line-up —
                  7 BIG portraits, nothing overlapping, nothing tiny
     4  PLAY      hover / focus / tap any portrait → it springs open
                  (accordion with a touch of overshoot), photo goes
                  full colour, cursor parallax inside the frame

   ENGINE: one damped scroll value + one spring per portrait, a
   single ticker that sleeps when the section is far away. Same
   engine style as Process.tsx, so forward and reverse are identical.

   YOUR PHOTOS: /public/about-us-img/team-img/img1 … img7
   (jpg / jpeg / png / webp all work). EDIT the TEAM array below.
   ═══════════════════════════════════════════════════════════════ */

const LIME = "#D2FF00";
const BG = "#0B0B0C";
const CREAM = "#EFEBE0";
const INK = "#0B0B0C";
const PHOTO_DIR = "/about-us-img/team-img";
const EXTS = [".jpg", ".jpeg", ".png", ".webp"];

export const TEAM = [
  { id: "img1", name: "Team Member 01", role: "Founder · Product Strategy", linkedin: "https://www.linkedin.com/in/your-id-1" },
  { id: "img2", name: "Team Member 02", role: "Co-Founder · Engineering", linkedin: "https://www.linkedin.com/in/your-id-2" },
  { id: "img3", name: "Team Member 03", role: "Lead Designer · UI/UX", linkedin: "https://www.linkedin.com/in/your-id-3" },
  { id: "img4", name: "Team Member 04", role: "Full-Stack Developer", linkedin: "https://www.linkedin.com/in/your-id-4" },
  { id: "img5", name: "Team Member 05", role: "Mobile Developer", linkedin: "https://www.linkedin.com/in/your-id-5" },
  { id: "img6", name: "Team Member 06", role: "AI / ML Engineer", linkedin: "https://www.linkedin.com/in/your-id-6" },
  { id: "img7", name: "Team Member 07", role: "QA & Project Manager", linkedin: "https://www.linkedin.com/in/your-id-7" },
];

const N = TEAM.length;

/* ───────── tuning ───────── */
const FX = 3.4; // how much wider the open portrait becomes (1 → 1+FX)
/* scroll budget of each phase, in viewport heights (≈3.4 screens in total, was 4.8) */
const PH = { hold: 0.12, curtain: 0.95, sweep: 1.7, release: 0.3, tail: 0.3 };
const SCROLL_VH = PH.hold + PH.curtain + PH.sweep + PH.release + PH.tail;
const HOLD = PH.hold / SCROLL_VH; // end of "headline alone"
const CURTAIN_END = (PH.hold + PH.curtain) / SCROLL_VH;
const SWEEP_START = CURTAIN_END;
const SWEEP_END = (PH.hold + PH.curtain + PH.sweep) / SCROLL_VH;
const LINEUP_END = (PH.hold + PH.curtain + PH.sweep + PH.release) / SCROLL_VH; // line-up becomes interactive

/* ───────── helpers ───────── */
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut2 = (t: number) => 1 - (1 - t) ** 2;
const easeOut3 = (t: number) => 1 - (1 - t) ** 3;
const easeInOut3 = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/* tries .jpg → .jpeg → .png → .webp, then a clean placeholder */
function TeamPhoto({ id, name }: { id: string; name: string }) {
  const [i, setI] = useState(0);
  if (i >= EXTS.length) {
    return (
      <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "linear-gradient(160deg,#2a2a2e,#111113)", color: "rgba(239,235,224,0.4)", fontFamily: '"Inter", sans-serif', fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.22em" }}>
        ADD PHOTO
      </div>
    );
  }
  return (
    <img
      src={`${PHOTO_DIR}/${id}${EXTS[i]}`}
      alt={name}
      draggable={false}
      decoding="async"
      onError={() => setI(i + 1)}
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 22%", display: "block" }}
    />
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3v-11zm6.5 0h3.8v1.5h.06c.53-1 1.84-2.06 3.78-2.06 4.04 0 4.78 2.66 4.78 6.1v5.46h-4v-4.84c0-1.16-.02-2.64-1.6-2.64-1.62 0-1.87 1.26-1.87 2.56v4.92h-4v-11z" />
    </svg>
  );
}

/* big headline letters (each in a mask so it can rise) */
function Word({ text, cls }: { text: string; cls: string }) {
  return (
    <>
      {Array.from(text).map((ch, k) =>
        ch === " " ? (
          <span key={k} aria-hidden="true" style={{ display: "inline-block", width: "0.26em" }} />
        ) : (
          <span key={k} aria-hidden="true" style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
            <span className={cls} style={{ display: "inline-block" }}>
              {ch}
            </span>
          </span>
        )
      )}
    </>
  );
}

const css = `
  .tm-row{display:flex;contain:layout}
  .tm-p{position:relative;flex:1 1 0;min-width:0;border-radius:18px;overflow:hidden;background:#141416;cursor:pointer;outline:none;contain:paint;-webkit-tap-highlight-color:transparent}
  .tm-img{position:absolute;inset:-5%;will-change:transform}
  .tm-lime{position:absolute;inset:0;background:${LIME};transform-origin:50% 0;will-change:transform}
  .tm-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(to top,rgba(11,11,12,.88) 0%,rgba(11,11,12,.35) 34%,rgba(11,11,12,0) 62%)}
  .tm-ring{position:absolute;inset:0;border-radius:18px;border:2px solid ${LIME};opacity:0;pointer-events:none}
  .tm-idx{position:absolute;top:1rem;left:1.1rem;font:700 .68rem "Inter",sans-serif;letter-spacing:.16em;color:${CREAM};z-index:3}
  .tm-vname{position:absolute;left:50%;bottom:1.3rem;writing-mode:vertical-rl;transform:translateX(-50%) rotate(180deg);font-family:"Anton",sans-serif;font-size:clamp(1.15rem,1.65vw,1.9rem);line-height:1;letter-spacing:.05em;text-transform:uppercase;color:${CREAM};white-space:nowrap;z-index:3;pointer-events:none}
  .tm-info{position:absolute;left:1.4rem;right:1.4rem;bottom:1.4rem;display:flex;flex-direction:column;gap:.7rem;z-index:3;pointer-events:none}
  .tm-name{font-family:"Anton",sans-serif;font-size:clamp(1.8rem,3vw,3.2rem);line-height:.95;letter-spacing:.005em;text-transform:uppercase;color:${LIME};white-space:nowrap}
  .tm-role{font:700 .68rem "Inter",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${CREAM};opacity:.9;white-space:nowrap}
  .tm-in{display:inline-flex;align-items:center;gap:.5rem;align-self:flex-start;padding:.7rem 1.05rem;border-radius:999px;background:${LIME};color:${INK};font:700 .66rem "Inter",sans-serif;letter-spacing:.16em;text-decoration:none;white-space:nowrap;transition:transform .35s cubic-bezier(.34,1.56,.64,1),background .25s}
  .tm-in:hover{transform:translateY(-2px) scale(1.06);background:${CREAM}}
  .tm-in:focus-visible{outline:2px solid ${CREAM};outline-offset:3px}
  .tm-side{font-family:"Inter",system-ui,sans-serif}
  /* static (phone / reduced motion) */
  .tm-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.4rem 1rem;max-width:620px;margin:2.4rem auto 0;text-align:left}
  @media (min-width:600px){.tm-grid{grid-template-columns:repeat(3,1fr);max-width:960px}}
  .tm-sc{display:flex;flex-direction:column;gap:.7rem}
  .tm-sc .ph{position:relative;aspect-ratio:3/4;border-radius:16px;overflow:hidden;background:#141416}
  .tm-sc .ph>*{position:absolute;inset:0}
  .tm-sc .nm{font-family:"Anton",sans-serif;font-size:1.25rem;line-height:1;text-transform:uppercase;color:${LIME}}
  .tm-sc .rl{font:700 .62rem "Inter",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${CREAM};opacity:.85;line-height:1.5}
  .tm-sc .in{display:inline-flex;align-items:center;gap:.4rem;align-self:flex-start;padding:.55rem .85rem;border-radius:999px;background:${LIME};color:${INK};font:700 .6rem "Inter",sans-serif;letter-spacing:.16em;text-decoration:none}
`;

export default function TeamShowcase() {
  const stickRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const cntRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [staticMode, setStaticMode] = useState(false);

  /* phones / reduced motion → plain grid (no pin) */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => setStaticMode(mq.matches || rm.matches);
    check();
    mq.addEventListener("change", check);
    rm.addEventListener("change", check);
    return () => {
      mq.removeEventListener("change", check);
      rm.removeEventListener("change", check);
    };
  }, []);

  useEffect(() => {
    if (staticMode) return;
    const stick = stickRef.current;
    const section = sectionRef.current;
    const head = headRef.current;
    const side = sideRef.current;
    const cnt = cntRef.current;
    const line = lineRef.current;
    const row = rowRef.current;
    if (!stick || !section || !head || !side || !cnt || !line || !row) return;

    let disposed = false;
    let stopTick: (() => void) | null = null;
    let activate: ((on: boolean) => void) | null = null;
    let active = true;
    let lastH = stick.offsetHeight;
    let lastW = window.innerWidth;
    let needRefresh = false;

    /* interaction state (lives across rebuilds) */
    let hover = -1;
    let interactive = false;

    const build = () => {
      if (disposed) return;
      stopTick?.();
      needRefresh = false;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      lastW = vw;
      const padX = Math.max(16, Math.min(40, vw * 0.022));
      const total = vh * SCROLL_VH;
      const newH = vh + total;
      stick.style.height = `${newH}px`;
      if (Math.abs(newH - lastH) > 1) {
        lastH = newH;
        needRefresh = true;
      }

      /* line-up geometry: big portraits fill the lower ~67vh, full width */
      row.style.left = `${padX}px`;
      row.style.right = `${padX}px`;
      row.style.bottom = `${Math.max(14, vh * 0.035)}px`;

      /* headline: natural (big) size → measured, then driven by transform */
      head.style.transform = "none";
      const HW = head.offsetWidth;
      const HH = head.offsetHeight;
      const sf = Math.min(0.56, (vh * 0.165) / Math.max(1, HH));
      const x0 = (vw - HW) / 2;
      const y0 = (vh - HH) / 2 - vh * 0.01;
      const x1 = padX;
      const y1 = vh * 0.115;
      /* the line-up always starts BELOW the shrunken headline (never overlaps "WHO SHIP") */
      row.style.top = `${Math.max(vh * 0.3, y1 + HH * sf + 18)}px`;

      side.style.right = `${padX}px`;
      side.style.top = `${vh * 0.125}px`;

      const letters = Array.from(head.querySelectorAll<HTMLElement>(".tl")).map((el, i) => ({ el, d: ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 0.4 }));
      const subs = Array.from(head.querySelectorAll<HTMLElement>(".tl-sub"));

      type P = {
        el: HTMLElement;
        img: HTMLElement;
        lime: HTMLElement;
        ring: HTMLElement;
        idx: HTMLElement;
        vname: HTMLElement;
        info: HTMLElement;
        pill: HTMLElement | null;
        w: number;
        v: number;
        px: number;
        py: number;
        tx: number;
        ty: number;
        s: Record<string, string>;
      };
      const panels: P[] = Array.from(row.querySelectorAll<HTMLElement>(".tm-p")).map((el) => ({
        el,
        img: el.querySelector<HTMLElement>(".tm-img")!,
        lime: el.querySelector<HTMLElement>(".tm-lime")!,
        ring: el.querySelector<HTMLElement>(".tm-ring")!,
        idx: el.querySelector<HTMLElement>(".tm-idx")!,
        vname: el.querySelector<HTMLElement>(".tm-vname")!,
        info: el.querySelector<HTMLElement>(".tm-info")!,
        pill: el.querySelector<HTMLElement>(".tm-in"),
        w: 1,
        v: 0,
        px: 0,
        py: 0,
        tx: 0,
        ty: 0,
        s: {},
      }));

      /* write a style only if it changed */
      const put = (p: P, key: string, el: HTMLElement, prop: "transform" | "opacity" | "filter" | "clipPath" | "flex" | "pointerEvents", val: string) => {
        if (p.s[key] === val) return;
        p.s[key] = val;
        el.style[prop] = val;
      };

      const rawRel = () => -stick.getBoundingClientRect().top;
      let relS = rawRel();
      let lastEnter = -1;
      let lastCount = -1;
      let running = false;
      let rowGap = -1;

      const render = (dt: number, scrollMoved: boolean) => {
        const p = clamp01(relS / total);

        /* ── intro letters (before the pin) ── */
        const eP = clamp01((relS + vh * 0.45) / (vh * 0.45));
        if (eP !== lastEnter) {
          lastEnter = eP;
          for (const l of letters) {
            const t = easeOut3(clamp01((eP - l.d) / 0.6));
            l.el.style.transform = `translate3d(0, ${((1 - t) * 118).toFixed(1)}%, 0) rotate(${((1 - t) * 9).toFixed(1)}deg)`;
          }
          for (const s of subs) s.style.opacity = String(easeOut2(clamp01((eP - 0.45) / 0.5)));
        }

        /* ── phase 1: headline glides up, curtain rises ── */
        const rp = clamp01((p - HOLD) / (CURTAIN_END - HOLD));
        const eh = easeInOut3(clamp01(rp / 0.55)); // headline leaves FIRST
        const hs = lerp(1, sf, eh);
        head.style.transform = `translate3d(${lerp(x0, x1, eh).toFixed(1)}px, ${lerp(y0, y1, eh).toFixed(1)}px, 0) scale(${hs.toFixed(4)})`;
        const gap = 10 * easeOut2(clamp01((rp - 0.35) / 0.4));
        if (Math.abs(gap - rowGap) > 0.05) {
          rowGap = gap;
          row.style.gap = `${gap.toFixed(2)}px`;
        }

        /* ── phase 2: sweep + release → target widths ── */
        const sp = clamp01((p - SWEEP_START) / (SWEEP_END - SWEEP_START));
        const i0 = Math.min(N - 2, Math.floor(sp * (N - 1)));
        const f = i0 + easeInOut3(sp * (N - 1) - i0); // dwells on every member
        const rl = easeInOut3(clamp01((p - SWEEP_END) / (LINEUP_END - SWEEP_END)));
        const sweepOn = rp >= 0.98 ? 1 - rl : 0;
        interactive = p >= LINEUP_END;
        row.style.pointerEvents = interactive ? "auto" : "none";

        /* side column: paragraph + counter + progress */
        const sideA = clamp01((rp - 0.8) / 0.2);
        side.style.opacity = sideA.toFixed(3);
        side.style.transform = `translate3d(0, ${((1 - easeOut2(sideA)) * 16).toFixed(1)}px, 0)`;
        line.style.transform = `scaleX(${clamp01(sp).toFixed(4)})`;
        const cur = interactive && hover >= 0 ? hover : Math.round(f);
        if (cur !== lastCount) {
          lastCount = cur;
          cnt.textContent = String(cur + 1).padStart(2, "0");
        }

        /* ── springs + per-portrait visuals ── */
        let moving = scrollMoved;
        const k = 170;
        const c = 21;
        const h = Math.min(dt, 0.04);
        for (let i = 0; i < N; i++) {
          const pn = panels[i]!;
          const focus =
            interactive && hover >= 0 ? (i === hover ? 1 : 0) : Math.max(0, 1 - Math.abs(i - f)) * sweepOn;
          const target = 1 + FX * focus;
          const a = (target - pn.w) * k - pn.v * c;
          pn.v += a * h;
          pn.w += pn.v * h;
          if (Math.abs(target - pn.w) > 0.0008 || Math.abs(pn.v) > 0.002) moving = true;
          else {
            pn.w = target;
            pn.v = 0;
          }
          /* pointer parallax (only matters while hovered) */
          const ptx = interactive && hover === i ? pn.tx : 0;
          const pty = interactive && hover === i ? pn.ty : 0;
          pn.px += (ptx - pn.px) * Math.min(1, h * 9);
          pn.py += (pty - pn.py) * Math.min(1, h * 9);
          if (Math.abs(ptx - pn.px) + Math.abs(pty - pn.py) > 0.02) moving = true;

          const fo = clamp01((pn.w - 1) / FX);
          /* local reveal; stagger 0.03, last portrait ends at rp 0.95 → always reaches 1 (no float error) */
          const r = clamp01((rp - 0.3 - 0.03 * i) / 0.47);
          const rev = easeOut3(clamp01(r / 0.72));
          const done = r >= 0.999;

          pn.el.style.flex = `${pn.w.toFixed(4)} 1 0`;
          put(pn, "clip", pn.el, "clipPath", done ? "none" : `inset(${((1 - rev) * 100).toFixed(2)}% 0 0 0 round 18px)`);
          put(pn, "lime", pn.lime, "transform", `scaleY(${(1 - easeInOut3(clamp01((r - 0.12) / 0.6))).toFixed(3)})`);
          const sc = (1.32 - 0.32 * easeOut3(r)) * (1 + 0.05 * fo);
          put(pn, "img", pn.img, "transform", `translate3d(${(pn.px * 16).toFixed(1)}px, ${(pn.py * 12 + (1 - rev) * 40).toFixed(1)}px, 0) scale(${sc.toFixed(4)})`);
          put(pn, "flt", pn.img, "filter", `grayscale(${(0.55 * (1 - fo)).toFixed(2)}) brightness(${(0.8 + 0.24 * fo).toFixed(2)})`);
          put(pn, "ring", pn.ring, "opacity", (fo * (done ? 1 : 0)).toFixed(3));
          const txt = done ? 1 : 0;
          put(pn, "idx", pn.idx, "opacity", (txt * (0.55 + 0.45 * fo)).toFixed(2));
          put(pn, "vn", pn.vname, "opacity", (txt * Math.max(0, 1 - fo * 1.7)).toFixed(3));
          const io = Math.max(0, (fo - 0.25) / 0.75);
          put(pn, "inf", pn.info, "opacity", (txt * io).toFixed(3));
          put(pn, "infT", pn.info, "transform", `translate3d(0, ${((1 - io) * 16).toFixed(1)}px, 0)`);
          if (pn.pill) put(pn, "pe", pn.pill, "pointerEvents", interactive && fo > 0.7 ? "auto" : "none");
        }
        return moving;
      };

      /* ───────── pointer wiring ───────── */
      const cleanups: Array<() => void> = [];
      panels.forEach((pn, i) => {
        const onEnter = (e: PointerEvent) => {
          if (e.pointerType === "mouse" && interactive) hover = i;
        };
        const onLeave = (e: PointerEvent) => {
          if (e.pointerType === "mouse" && hover === i) hover = -1;
        };
        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          const r = pn.el.getBoundingClientRect();
          pn.tx = ((e.clientX - r.left) / r.width - 0.5) * -2;
          pn.ty = ((e.clientY - r.top) / r.height - 0.5) * -2;
        };
        const onUp = (e: PointerEvent) => {
          if (e.pointerType === "mouse" || !interactive) return;
          if ((e.target as HTMLElement).closest("a")) return;
          hover = hover === i ? -1 : i; // tap to open / close on touch
        };
        const onFocus = () => {
          if (interactive) hover = i;
        };
        const onBlur = (e: FocusEvent) => {
          /* keep it open while focus moves to the LinkedIn pill inside the same portrait */
          if (hover === i && !pn.el.contains(e.relatedTarget as Node | null)) hover = -1;
        };
        pn.el.addEventListener("pointerenter", onEnter);
        pn.el.addEventListener("pointerleave", onLeave);
        pn.el.addEventListener("pointermove", onMove, { passive: true });
        pn.el.addEventListener("pointerup", onUp);
        pn.el.addEventListener("focusin", onFocus);
        pn.el.addEventListener("focusout", onBlur);
        cleanups.push(() => {
          pn.el.removeEventListener("pointerenter", onEnter);
          pn.el.removeEventListener("pointerleave", onLeave);
          pn.el.removeEventListener("pointermove", onMove);
          pn.el.removeEventListener("pointerup", onUp);
          pn.el.removeEventListener("focusin", onFocus);
          pn.el.removeEventListener("focusout", onBlur);
        });
      });

      /* ───────── the ONE ticker (sleeps when the section is far away) ───────── */
      const tick = (_t: number, deltaMs: number) => {
        const dt = Math.min(deltaMs, 50) / 1000;
        const rel = rawRel();
        const dS = rel - relS;
        const scrollMoved = Math.abs(dS) > 0.08;
        relS = scrollMoved ? relS + dS * (1 - Math.exp(-dt * 11)) : rel;
        render(dt, scrollMoved);
      };

      activate = (on: boolean) => {
        if (on === running) return;
        running = on;
        if (on) {
          relS = rawRel();
          lastEnter = -1;
          gsap.ticker.add(tick);
          render(0.016, true);
        } else {
          gsap.ticker.remove(tick);
        }
      };
      stopTick = () => {
        gsap.ticker.remove(tick);
        running = false;
        cleanups.forEach((fn) => fn());
      };

      row.style.visibility = "visible";
      head.style.visibility = "visible";
      render(0.016, true); // first frame even if asleep
      activate(active);
      if (needRefresh) requestAnimationFrame(() => !disposed && ScrollTrigger.refresh());
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        active = !!entry?.isIntersecting;
        activate?.(active);
      },
      { rootMargin: "60% 0px 60% 0px" }
    );
    io.observe(stick);

    const fonts = document.fonts;
    if (fonts) Promise.all([fonts.ready, fonts.load('40px "Anton"').catch(() => null)]).then(build, build);
    else build();

    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        if (Math.abs(window.innerWidth - lastW) < 2 && window.innerWidth < 900) return; // mobile bar jitter
        build();
      }, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
      io.disconnect();
      stopTick?.();
    };
  }, [staticMode]);

  const headBlock = (
    <>
      <div className="tl-sub" style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 300, fontSize: "clamp(1rem, 1.9vw, 1.7rem)", letterSpacing: "0.08em", textTransform: "uppercase", color: LIME, marginBottom: "0.3em" }}>
        MEET THE
      </div>
      <div style={{ fontFamily: '"Anton", sans-serif', fontSize: "clamp(3.2rem, 11vw, 10.5rem)", lineHeight: 0.95, textTransform: "uppercase", color: LIME, letterSpacing: "-0.005em", whiteSpace: "nowrap" }} aria-label="Altima Crew">
        <Word text="ALTIMA CREW" cls="tl" />
      </div>
      <div className="tl-sub" style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 300, fontSize: "clamp(1rem, 1.9vw, 1.7rem)", letterSpacing: "0.08em", textTransform: "uppercase", color: LIME, marginTop: "0.3em", textAlign: "right" }}>
        WHO SHIP
      </div>
    </>
  );

  /* ── static (phone / reduced-motion) ── */
  if (staticMode) {
    return (
      <div style={{ backgroundColor: BG, color: LIME, padding: "14vh 1.2rem 12vh", textAlign: "center" }}>
        <style>{css}</style>
        <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>MEET THE</div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: "clamp(2.6rem, 12vw, 4.5rem)", lineHeight: 0.95, textTransform: "uppercase" }}>ALTIMA CREW</div>
        <div style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: "1rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>WHO SHIP</div>
        <p style={{ margin: "1rem auto 0", maxWidth: "40ch", fontFamily: '"Inter", sans-serif', fontSize: "0.9rem", lineHeight: 1.5, color: CREAM, opacity: 0.85 }}>
          Seven designers and engineers, one goal: ship your product fast, clean and on time.
        </p>
        <div className="tm-grid">
          {TEAM.map((m, i) => (
            <div className="tm-sc" key={m.id}>
              <div className="ph">
                <TeamPhoto id={m.id} name={m.name} />
              </div>
              <div className="nm">{m.name}</div>
              <div className="rl">
                [{String(i + 1).padStart(2, "0")}] {m.role}
              </div>
              <a className="in" href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}>
                <LinkedInIcon /> LINKEDIN ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── animated desktop ── */
  return (
    <div style={{ backgroundColor: BG, visibility: "visible", isolation: "isolate" }}>
      <style>{css}</style>

      {/* lime arc from About hangs over the dark team section */}
      <div aria-hidden="true" style={{ position: "relative", height: "16vh", overflow: "hidden", backgroundColor: BG }}>
        <div style={{ position: "absolute", top: 0, left: "-28%", width: "156%", height: "100%", background: LIME, borderRadius: "0 0 50% 50% / 0 0 100% 100%" }} />
      </div>

      <div ref={stickRef} style={{ position: "relative", height: `${100 + SCROLL_VH * 100}vh` }}>
        <section
          ref={sectionRef}
          id="team"
          style={{
            position: "sticky",
            top: 0,
            width: "100%",
            height: "100vh",
            overflow: "hidden",
            contain: "paint",
            backgroundColor: BG,
          }}
        >
          {/* film grain on its own static layer */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              transform: "translateZ(0)",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* headline: big & centred first, glides to the top-left */}
          <div
            ref={headRef}
            style={{ position: "absolute", left: 0, top: 0, zIndex: 10, transformOrigin: "0 0", willChange: "transform", pointerEvents: "none", visibility: "hidden", width: "max-content" }}
          >
            {headBlock}
          </div>

          {/* side column (appears with the sweep): copy · counter · progress */}
          <div
            ref={sideRef}
            className="tm-side"
            style={{ position: "absolute", zIndex: 10, maxWidth: "min(34ch, 30vw)", textAlign: "right", color: CREAM, opacity: 0, pointerEvents: "none" }}
          >
            <p style={{ margin: 0, fontSize: "clamp(0.8rem, 0.95vw, 0.95rem)", lineHeight: 1.55, opacity: 0.85 }}>
              Seven designers and engineers, one goal: ship your product fast, clean and on time.
            </p>
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: "0.5rem", fontFamily: '"Anton", sans-serif', color: LIME, lineHeight: 1 }}>
              <span ref={cntRef} style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.6rem)" }}>01</span>
              <span style={{ fontSize: "clamp(0.9rem, 1.2vw, 1.2rem)", opacity: 0.55 }}>/ {String(N).padStart(2, "0")}</span>
            </div>
            <div style={{ marginTop: "0.7rem", height: 2, background: "rgba(239,235,224,0.16)", overflow: "hidden" }}>
              <div ref={lineRef} style={{ width: "100%", height: "100%", background: LIME, transformOrigin: "0 50%", transform: "scaleX(0)" }} />
            </div>
          </div>

          {/* the line-up: 7 big portraits, full width */}
          <div ref={rowRef} className="tm-row" style={{ position: "absolute", zIndex: 5, visibility: "hidden", pointerEvents: "none" }}>
            {TEAM.map((m, i) => (
              <div key={m.id} className="tm-p" tabIndex={0} role="group" aria-label={`${m.name}, ${m.role}`}>
                <div className="tm-img">
                  <TeamPhoto id={m.id} name={m.name} />
                </div>
                <div className="tm-shade" aria-hidden="true" />
                <div className="tm-lime" aria-hidden="true" />
                <div className="tm-ring" aria-hidden="true" />
                <span className="tm-idx" aria-hidden="true">[{String(i + 1).padStart(2, "0")}]</span>
                <span className="tm-vname" aria-hidden="true">{m.name}</span>
                <div className="tm-info">
                  <div className="tm-name">{m.name}</div>
                  <div className="tm-role">{m.role}</div>
                  <a className="tm-in" href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`}>
                    <LinkedInIcon /> LINKEDIN ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}