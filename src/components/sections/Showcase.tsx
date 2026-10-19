"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════
   SHOWCASE — the IMAGE section. Place right AFTER <Process />.
   Lime background, dark type, 4 photo cards (no overlap).
   • curve  : Process ends in a dark arc over this lime section
   • reveal : cards rise + untilt as you scroll in (scrubbed, reversible)
   • hover  : each card tilts in 3D toward the cursor, image zooms, lifts
   ADD YOUR IMAGES: put `src` in SHOWCASE below (e.g. "/work/fintech.jpg").
   ═══════════════════════════════════════════════════════════════ */

const LIME = "#D2FF00";
const BG = "#0B0B0C";
const INK = "#111112";

export const SHOWCASE: { title: string; tag: string; src?: string; alt?: string }[] = [
  { title: "FINTECH DASHBOARD", tag: "WEB APP · 2026" },
  { title: "AI SUPPORT TOOL", tag: "SAAS · 2026" },
  { title: "MOBILE BOOKING APP", tag: "IOS + ANDROID" },
  { title: "STARTUP WEBSITE", tag: "BRAND + SITE" },
];

export default function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let ctx: gsap.Context | null = null;
    const cleanups: Array<() => void> = [];

    const build = () => {
      if (disposed) return;
      cleanups.splice(0).forEach((f) => f());
      ctx?.revert();
      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".sc-card");
        const head = section.querySelector<HTMLElement>(".sc-head");

        /* explicit from → to  ⇒ symmetric reverse */
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: section, start: "top 78%", end: "top 8%", scrub: 0.6, invalidateOnRefresh: true },
        });
        if (head) tl.fromTo(head, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0);
        cards.forEach((c, i) => {
          const rot = [-5, 4, -4, 5][i % 4] ?? 0;
          tl.fromTo(c, { y: 140 + i * 24, rotation: rot * 2.2, opacity: 0 }, { y: 0, rotation: rot, opacity: 1, duration: 0.6 }, 0.12 + i * 0.1);
        });

        /* hover: 3D tilt toward cursor */
        cards.forEach((c) => {
          const inner = c.querySelector<HTMLElement>(".sc-tilt");
          const img = c.querySelector<HTMLElement>(".sc-img");
          if (!inner || !img) return;
          const rx = gsap.quickTo(inner, "rotationX", { duration: 0.5, ease: "power3" });
          const ry = gsap.quickTo(inner, "rotationY", { duration: 0.5, ease: "power3" });
          const lift = gsap.quickTo(inner, "y", { duration: 0.5, ease: "power3" });
          const zoom = gsap.quickTo(img, "scale", { duration: 0.6, ease: "power3" });
          const move = (e: PointerEvent) => {
            const r = c.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            ry(nx * 16);
            rx(-ny * 16);
            lift(-12);
            zoom(1.08);
          };
          const leave = () => {
            rx(0);
            ry(0);
            lift(0);
            zoom(1);
          };
          c.addEventListener("pointermove", move);
          c.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            c.removeEventListener("pointermove", move);
            c.removeEventListener("pointerleave", leave);
          });
        });
      }, section);
    };

    build();
    document.fonts?.ready.then(() => {
      if (disposed) return;
      build();
      ScrollTrigger.refresh();
    });
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(build, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
      cleanups.splice(0).forEach((f) => f());
      ctx?.revert();
      ctx = null;
    };
  }, []);

  return (
    <div style={{ backgroundColor: LIME, visibility: "visible" }}>
      <style>{`
        .sc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(1rem,2.4vw,2.2rem);align-items:start}
        .sc-card:nth-child(even){margin-top:clamp(1.5rem,6vh,4rem)}
        @media (max-width:900px){.sc-grid{grid-template-columns:repeat(2,1fr)}}
        @media (max-width:520px){.sc-grid{grid-template-columns:1fr}.sc-card:nth-child(even){margin-top:0}}
        .sc-cta{transition:transform .35s cubic-bezier(.16,1,.3,1)}
        .sc-cta:hover{transform:translateY(-4px) scale(1.05)}
      `}</style>

      {/* dark arc from Process hangs over this lime section */}
      <div aria-hidden="true" style={{ position: "relative", height: "16vh", overflow: "hidden", backgroundColor: LIME }}>
        <div style={{ position: "absolute", top: 0, left: "-28%", width: "156%", height: "100%", background: BG, borderRadius: "0 0 50% 50% / 0 0 100% 100%" }} />
      </div>

      <section ref={sectionRef} id="showcase" style={{ position: "relative", padding: "6vh clamp(1.2rem,5vw,5rem) 14vh", color: INK }}>
        <div className="sc-head" style={{ textAlign: "center", marginBottom: "8vh" }}>
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "0.45rem 0.9rem", borderRadius: 8, background: INK, color: LIME, fontFamily: '"Anton", sans-serif', fontSize: "0.8rem", letterSpacing: "0.12em" }}
          >
            SELECTED WORK
          </span>
          <h2 style={{ margin: "1.2rem auto 0", fontFamily: '"Anton", sans-serif', fontWeight: 400, textTransform: "uppercase", lineHeight: 0.92, letterSpacing: "-0.01em", fontSize: "clamp(2.6rem, 8vw, 7rem)", maxWidth: "14ch" }}>
            LET’S MAKE IT YOUR NEXT LAUNCH.
          </h2>
        </div>

        <div className="sc-grid" style={{ perspective: 1100, maxWidth: 1400, margin: "0 auto" }}>
          {SHOWCASE.map((p) => (
            <article key={p.title} className="sc-card" style={{ willChange: "transform" }}>
              <div className="sc-tilt" style={{ transformStyle: "preserve-3d" }}>
                <div style={{ position: "relative" }}>
                  <div aria-hidden="true" style={{ position: "absolute", top: "-3.5%", left: "30%", width: "40%", height: "8%", background: "rgba(222,196,150,0.95)", transform: "rotate(-3deg)", zIndex: 2 }} />
                  <div
                    style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: "14%/11%", overflow: "hidden", background: "linear-gradient(145deg,#2a2a2e 0%,#141416 100%)", boxShadow: "8px 10px 0 rgba(17,17,18,0.9)" }}
                  >
                    <div className="sc-img" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                      {p.src ? (
                        <img src={p.src} alt={p.alt ?? p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontFamily: '"Inter", sans-serif', fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.25em", color: "rgba(239,235,224,0.5)" }}>ADD IMAGE</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "1.1rem" }}>
                  <div style={{ fontFamily: '"Anton", sans-serif', fontSize: "clamp(1.1rem,1.7vw,1.6rem)", letterSpacing: "0.02em" }}>{p.title}</div>
                  <div style={{ fontFamily: '"Inter", sans-serif', fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.2em", opacity: 0.7, marginTop: "0.2rem" }}>{p.tag}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "9vh" }}>
          <a
            href="/contact"
            className="sc-cta"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "1.1rem 1.9rem", borderRadius: 999, background: INK, color: LIME, fontFamily: '"Anton", sans-serif', fontSize: "1.05rem", letterSpacing: "0.1em", textDecoration: "none" }}
          >
            START YOUR PROJECT ↗
          </a>
        </div>
      </section>
    </div>
  );
}