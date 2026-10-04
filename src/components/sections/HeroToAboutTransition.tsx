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
   • ONE ScrollTrigger / ONE timeline, scrub 0.6, pin +=700.

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
   Order in page:  <Hero /> <HeroToAboutTransition /> <About />
   ═══════════════════════════════════════════════════════════════ */

const LIME = "#D2FF00";
const BALL_R = 9; // px, ScrollWatch dot is 18px
const ORBIT_R = 98;
const WATCH_TOP = 0.7;
const HANDOFF = 0.7;
const PIN = 700;

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
    const about = wrapper?.nextElementSibling as HTMLElement | null;
    if (!wrapper || !overlay || !svg || !ring || !dot || !hero || !about) return;

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
        const cx = vw / 2;
        const diag = Math.hypot(vw, vh);

        const handoffPx = HANDOFF * (hero.offsetHeight - vh);
        const L1 = hero.offsetHeight - handoffPx; // hand-off → pin start
        const f = L1 / (L1 + PIN);
        const startY = (WATCH_TOP - 0.5) * vh + ORBIT_R;

        /* ── pull About up over the pinned canvas so it can fade in there ── */
        gsap.set(about, { marginTop: "-100vh", zIndex: 2, opacity: 0, y: 40 });

        /* ── the single animated state: drawn as SVG attributes ── */
        const s = { y: startY, ro: BALL_R, ri: 0, dr: 0 };
        const render = () => {
          const cy = vh / 2 + s.y;
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

        /* pin only */
        ScrollTrigger.create({
          trigger: wrapper,
          start: "top top",
          end: `+=${PIN}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        const at = (p: number) => f + (1 - f) * p;
        const span = (p: number) => (1 - f) * p;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: render,
          scrollTrigger: {
            trigger: hero,
            start: `top+=${handoffPx} top`,
            endTrigger: wrapper,
            end: `top+=${PIN} top`,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const on = self.progress > 0 && self.progress < 1;
              gsap.set(overlay, { visibility: on ? "visible" : "hidden" });
            },
            onToggle: (self) => {
              if (!self.isActive) gsap.set(overlay, { visibility: "hidden" });
            },
          },
        });

        /* ── A: rim → dead center, linear (never stalls) ── */
        tl.to(s, { y: 0, duration: f }, 0);

        /* ── B1: ball → disk, hole opens inside the SAME shape, dot spawns ── */
        tl.to(s, { ro: 90, ease: "power2.out", duration: span(0.3) }, at(0));
        tl.to(s, { ri: 56, ease: "power2.out", duration: span(0.3) }, at(0.06));
        tl.to(s, { dr: 26, ease: "back.out(1.6)", duration: span(0.28) }, at(0.17));

        /* ── B2: exponential outward → flood (done at 85%) ── */
        tl.to(s, { ro: diag * 1.7, ri: diag * 1.05, dr: diag * 0.62, ease: "power3.in", duration: span(0.4) }, at(0.45));
        tl.to(wrapper, { backgroundColor: LIME, duration: span(0.01) }, at(0.85));

        /* ── B3: flood fades out, About fades in (reversible) ── */
        tl.to(svg, { opacity: 0, ease: "power1.inOut", duration: span(0.15) }, at(0.85));
        tl.to(about, { opacity: 1, y: 0, ease: "power2.out", duration: span(0.15) }, at(0.85));
      });
      ScrollTrigger.refresh();
    };

    build();

    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(build, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
      ctx?.revert();
      gsap.set(about, { clearProps: "marginTop,zIndex,opacity,transform" });
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
          overflow: "hidden",
          backgroundColor: "#000000",
          zIndex: 1,
        }}
      />
      {mounted &&
        createPortal(
          <div
            ref={overlayRef}
            aria-hidden="true"
            style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none", visibility: "hidden" }}
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