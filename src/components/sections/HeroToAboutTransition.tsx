import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   HERO → ABOUT  OBYS-STYLE DONUT TRANSITION — VECTOR VERSION

   • ONE lime shape, pure SVG, no CSS scale(). It is a <circle> drawn
     with a stroke:  outer radius ro, inner radius ri.
         ri = 0  → solid ball / disk
         ri > 0  → donut (the hole opens inside the SAME shape)
     plus one center <circle> dot.  Radii are animated as SVG
     attributes, so the browser re-rasterizes the vector every frame
     → edges stay razor sharp at any size (no bitmap upscaling).
   • ONE ScrollTrigger / ONE timeline, scrub 0.6, pin +=600.

   Timeline
     A  (hand-off → pin start) : ball glides clock rim → dead center
     B  pin 0   → 45%  : ball grows to disk, hole opens (donut), dot spawns
        pin 45% → 85%  : ring + hole + dot grow exponentially → flood #D2FF00
        pin 85% → 100% : flood fades out while About fades in (opacity 0→1,
                         y 40→0). Fully reversible on scroll-up.

   About is pulled up over the pinned black canvas (margin-top:-100vh,
   z-index 2, opacity 0) so it is really on screen when it fades in.

   Hero.tsx edit (hand-off, nothing else):
     const orbitDotOpacity = useTransform(smooth, [0, 0.7, 0.72], [1, 1, 0]);
   Order in page:  <Hero /> <HeroToAboutTransition /> <About /> <Services />
   ═══════════════════════════════════════════════════════════════ */

const LIME = "#D2FF00";
const BALL_R = 9; // px, ScrollWatch dot is 18px
const ORBIT_R = 98;
const WATCH_TOP = 0.7;
const HANDOFF = 0.7;
const PIN = 600;

export default function HeroToAboutTransition() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const wrapper = wrapperRef.current;
    const overlay = overlayRef.current;
    const svg = svgRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    const hero = wrapper?.previousElementSibling as HTMLElement | null;
    // About is found by id (NOT by "next sibling") so we can never pull the wrong section up.
    const about = document.getElementById("about") as HTMLElement | null;
    if (!wrapper || !overlay || !svg || !ring || !dot || !hero || !about) return;

    // Hard guard: required order is  Hero → HeroToAboutTransition → About → Services
    const next = wrapper.nextElementSibling;
    if (!next || !next.contains(about) || hero.contains(about)) {
      console.error(
        "[HeroToAboutTransition] Wrong DOM order. Render exactly:\n" +
          "<Hero /> <HeroToAboutTransition /> <About /> <Services />\n" +
          `Found next sibling: <${next?.tagName.toLowerCase()} id="${(next as HTMLElement | null)?.id ?? ""}">, expected #about.`
      );
      return;
    }
    // element that is physically pulled up over the pin (About itself, or its direct wrapper)
    const pull = next as HTMLElement;

    /* Sections AFTER About (Services …): invisible until the pin is fully over, so
       they can never peek/overlap during the transition, forward OR reverse. */
    const lower: HTMLElement[] = [];
    for (let el = pull.nextElementSibling; el; el = el.nextElementSibling) lower.push(el as HTMLElement);
    const curtain = (done: boolean) => lower.forEach((el) => (el.style.visibility = done ? "" : "hidden"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(overlay, { display: "none" });
      gsap.set(wrapper, { backgroundColor: LIME });
      return;
    }

    let ctx: gsap.Context | null = null;

    const build = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const diag = Math.hypot(vw, vh);

        const handoffPx = HANDOFF * (hero.offsetHeight - vh);
        const L1 = hero.offsetHeight - handoffPx; // hand-off → pin start
        const f = L1 / (L1 + PIN);
        const holdPx = Math.max(0, hero.offsetHeight - vh - handoffPx); // Hero still sticky
        const h = holdPx / (L1 + PIN); // timeline share where ball stays parked on the rim
        const startY = (WATCH_TOP - 0.5) * vh + ORBIT_R;

        /* ── About: pulled up over the pinned canvas, layered, hidden by default ──
           z-index map:  black wrapper 20 · ball/donut overlay 40 · About 45
           (45 not 50 so a z-50 Nav stays on top). */
        gsap.set(pull, {
          position: "relative",
          marginTop: "-100vh",
          zIndex: 45,
          visibility: "hidden", // visibility is the gate: hidden = no events, visible = live brush
          pointerEvents: "none",
          y: -PIN, // cancels About's natural slide-up → it sits at viewport top while pinned
        });
        const items = about.querySelectorAll<HTMLElement>("[class*='max-w-7xl'], img");
        gsap.set(items, { opacity: 0, y: 30 });
        const revealAt = 0.85; // pin progress where donut ≈ full coverage

        /* ── the single animated state: drawn as SVG attributes ── */
        const s = { y: 0, ro: BALL_R, ri: 0, dr: 0 };
        gsap.set(s, { y: startY }); // explicit start = clock rim, 6 o'clock
        const off = { x: 0, y: 0 }; // hand-off correction (hero dot → rim), decays to 0
        const render = () => {
          const cx = vw / 2 + off.x;
          const cy = vh / 2 + s.y + off.y;
          const sw = Math.max(0, s.ro - s.ri);
          ring.setAttribute("cx", String(cx));
          ring.setAttribute("cy", String(cy));
          ring.setAttribute("r", String(Math.max(0, (s.ro + s.ri) / 2)));
          ring.setAttribute("stroke-width", String(sw));
          dot.setAttribute("cx", String(cx));
          dot.setAttribute("cy", String(cy));
          dot.setAttribute("r", String(Math.max(0, s.dr)));
        };
        render();
        gsap.set(overlay, { visibility: "hidden" });
        gsap.set(svg, { opacity: 1 });
        gsap.set(wrapper, { backgroundColor: "#000000" });

        /* ── ONE dot at all times: hide Hero's own orbit dot the instant the
           overlay ball detaches. Found by its inline style (18px lime circle). ── */
        const heroDot = Array.from(hero.querySelectorAll<HTMLElement>("div")).find(
          (el) => el.style.width === "18px" && el.style.height === "18px" && el.style.borderRadius === "50%"
        );
        let detached = false;
        const detach = () => {
          if (detached) return;
          detached = true;
          if (heroDot) {
            // Hero's dot is spring-lagged: start the ball exactly where it IS right now,
            // then ease the tiny offset to the nominal rim point (no jump, no 2nd dot).
            const r = heroDot.getBoundingClientRect();
            off.x = r.left + r.width / 2 - vw / 2;
            off.y = r.top + r.height / 2 - (WATCH_TOP * vh + ORBIT_R);
            heroDot.style.visibility = "hidden";
            gsap.killTweensOf(off);
            gsap.to(off, { x: 0, y: 0, duration: 0.3, ease: "power2.out", onUpdate: render });
          }
        };
        const attach = () => {
          if (!detached) return;
          detached = false;
          gsap.killTweensOf(off);
          off.x = 0;
          off.y = 0;
          if (heroDot) heroDot.style.visibility = "";
        };

        /* pin only */
        ScrollTrigger.create({
          trigger: wrapper,
          start: "top top",
          end: `+=${PIN}`,
          pin: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        });

        const at = (p: number) => f + (1 - f) * p;
        const span = (p: number) => (1 - f) * p;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: () => {
            render();
            // Visibility is derived from the SAME scrubbed timeline that drives the
            // donut → content can never outlive the lime on reverse.
            const show = tl.time() >= at(revealAt);
            gsap.set(pull, { visibility: show ? "visible" : "hidden", pointerEvents: show ? "auto" : "none" });
          },
          scrollTrigger: {
            trigger: hero,
            start: `top+=${handoffPx} top`,
            endTrigger: wrapper,
            end: `top+=${PIN} top`,
            scrub: 0.6,
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
            onRefresh: (self) => curtain(self.progress >= 1),
            onEnterBack: () => curtain(false),
            onUpdate: (self) => {
              // keep About locked to viewport top during the pin, driven by RAW scroll
              // (not the smoothed timeline) so it cancels the native slide-up exactly
              const pinned = Math.min(1, Math.max(0, (self.progress - f) / (1 - f)));
              gsap.set(pull, { y: -PIN * (1 - pinned) });
              curtain(self.progress >= 1);
              if (self.progress > 0) detach();
              else attach();
              const on = self.progress > 0 && self.progress < 1;
              gsap.set(overlay, { visibility: on ? "visible" : "hidden" });
            },
            onToggle: (self) => {
              if (!self.isActive) gsap.set(overlay, { visibility: "hidden" });
            },
            // ── boundary snap: scrub smoothing (0.6s) must never let the page layout
            // (driven by RAW scroll) outrun the animation state. If the user leaves the
            // range fast, finish the scrub tween instantly → About fully shown / hidden,
            // so Services or the black canvas can never peek through.
            onLeave: (self) => {
              self.getTween()?.progress(1) ?? self.animation?.progress(1);
              curtain(true);
            },
            onLeaveBack: (self) => {
              self.getTween()?.progress(1) ?? self.animation?.progress(0);
              curtain(false);
            },
          },
        });

        /* ── A: rim → dead center, linear (never stalls) ── */
        // parked on the rim while Hero is sticky (no upward drift through the dial),
        // then one continuous glide once Hero releases (Hero scrolls up faster than
        // the ball → ball falls DOWN relative to the page into the black section).
        tl.to(s, { y: 0, duration: f - h }, h);

        /* ── B1: ball → disk, hole opens inside the SAME shape, dot spawns ── */
        tl.to(s, { ro: 90, ease: "power2.out", duration: span(0.3) }, at(0));
        tl.to(s, { ri: 56, ease: "power2.out", duration: span(0.3) }, at(0.06));
        tl.to(s, { dr: 26, ease: "back.out(1.6)", duration: span(0.28) }, at(0.17));

        /* ── B2: exponential outward → flood (done at 85%) ── */
        tl.to(s, { ro: diag * 1.7, ri: diag * 1.05, dr: diag * 0.62, ease: "power3.in", duration: span(0.4) }, at(0.45));
        tl.to(wrapper, { backgroundColor: LIME, duration: span(0.01) }, at(0.85));

        /* ── B3: flood fades out, About fades in (reversible) ── */
        tl.to(svg, { opacity: 0, ease: "power1.inOut", duration: span(0.15) }, at(0.85));
        // content: opacity 0→1, y 30→0 strictly inside 85–100%, fully scrubbed (reverses exactly)
        tl.fromTo(
          items,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, ease: "power2.out", duration: span(0.15), immediateRender: false },
          at(revealAt)
        );
      });
      ScrollTrigger.refresh();
    };

    build();

    // late layout changes (fonts / images / dynamic content) → re-measure
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh);

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
      curtain(true);
      gsap.set(pull, { clearProps: "marginTop,zIndex,visibility,pointerEvents,transform" });
      gsap.set(about.querySelectorAll("[class*='max-w-7xl'], img"), { clearProps: "opacity,transform" });
    };
  }, [mounted]);

  return (
    <>
      <div
        ref={wrapperRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          backgroundColor: "#000000",
          zIndex: 20,
        }}
      />
      {mounted &&
        createPortal(
          <div
            ref={overlayRef}
            aria-hidden="true"
            style={{ position: "fixed", inset: 0, zIndex: 40, pointerEvents: "none", visibility: "hidden" }}
          >
            {/* No will-change / 3D layer on purpose: a promoted layer is rasterized
                once and bitmap-scaled (= blocky). SVG attributes re-rasterize crisp. */}
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              shapeRendering="geometricPrecision"
              style={{ display: "block" }}
            >
              <circle ref={ringRef} fill="none" stroke={LIME} />
              <circle ref={dotRef} fill={LIME} />
            </svg>
          </div>,
          document.body
        )}
    </>
  );
}