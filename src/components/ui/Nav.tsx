import { useEffect, useRef, useState, useCallback } from "react";
import type { CSSProperties } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import Logo, { type LogoTheme } from "@/components/Logo";

/* ═══════════════════════════════════════════════════════════════
   NAV — "PULL ME" paper menu (Altima theme: ink · lime · cream)

   CLOSED : brand on the left + a paper tab "PULL ME" hanging from
            the top-right edge (torn zig-zag bottom).
   OPEN   : click the tab → the paper drops down, dotted lines draw
            left→right, every letter pops up from a mask, arrows pop in.
   HOVER  : the row text slides right, a small rounded image pops in on
            the left (tilted, springy) and the ↗ arrow turns into →.
   CLOSE  : click the tab again · Esc · click outside · route change.

   ▸ ADD YOUR HOVER IMAGES: fill the `img` field in LINKS below
     (e.g. img: "/nav/about.jpg"). Until then a lime burst tile shows.
   ═══════════════════════════════════════════════════════════════ */

type NavLink = { label: string; to: string; img?: string };

const LINKS: NavLink[] = [
  { label: "HOME", to: "/", img: "/navbar-img/home.webp" },
  { label: "ABOUT", to: "/about", img: "/navbar-img/about.webp" },
  { label: "SERVICES", to: "/services", img: "/navbar-img/services.webp" },
  { label: "WORK", to: "/work", img: "/navbar-img/work.webp" },
  { label: "CONTACT", to: "/contact", img: "/navbar-img/contact.webp" },
];

interface NavProps {
  isVisible?: boolean;
}

const css = `
.nv{
  --ink:#0B0B0C; --cream:#EFEBE0; --lime:#D2FF00;
  --out:cubic-bezier(.16,1,.3,1); --pop:cubic-bezier(.34,1.56,.64,1);
  --img:clamp(44px,3.5vw,58px);
  width:clamp(280px,30vw,470px);
  font-family:"Anton",sans-serif;
}
/* paper drop: grid rows 0fr → 1fr (tab always sits under the panel) */
.nv-wrap{display:grid;grid-template-rows:0fr auto;transition:grid-template-rows .65s cubic-bezier(.65,0,.35,1)}
.nv-open .nv-wrap{grid-template-rows:1fr auto;transition-duration:.95s;transition-timing-function:cubic-bezier(.7,0,.15,1)}
.nv-clip{min-height:0;overflow:hidden;background:var(--cream);border-radius:0 0 0 22px;visibility:hidden;transition:visibility 0s linear .65s}
.nv-open .nv-clip{visibility:visible;transition-delay:0s;box-shadow:0 22px 40px -18px rgba(0,0,0,.45)}
.nv-list{list-style:none;margin:0;padding:.35rem 1.5rem 1rem}

/* row + dotted separator that draws left → right */
.nv-row{position:relative}
.nv-line{
  position:absolute;left:0;right:0;top:0;height:4px;pointer-events:none;
  background-image:radial-gradient(circle,var(--ink) 1.1px,transparent 1.6px);
  background-size:6px 4px;background-repeat:repeat-x;
  transform:scaleX(0);transform-origin:left center;transition:transform .3s ease-in;
}
.nv-open .nv-line{transform:scaleX(1);transition:transform .95s var(--out) calc(.3s + var(--r)*70ms)}
.nv-end{height:4px}

.nv-link{
  position:relative;display:flex;align-items:center;justify-content:space-between;
  padding:.95rem 0 .8rem;color:var(--ink);text-decoration:none;outline:none;
}
.nv-link:focus-visible .nv-mask{box-shadow:0 3px 0 var(--lime)}

/* label: masked letters that spring up, whole label slides right on hover */
.nv-slide{display:inline-flex;transition:transform .55s var(--out)}
.nv-link:hover .nv-slide,.nv-link:focus-visible .nv-slide{transform:translateX(calc(var(--img) + 16px))}
.nv-mask{display:inline-block;overflow:hidden;font-size:clamp(1.9rem,2.9vw,2.8rem);line-height:1.08;letter-spacing:.005em;text-transform:uppercase}
.nv-l{display:inline-block;transform:translateY(118%) rotate(9deg);transform-origin:0 100%;transition:transform .25s ease-in}
.nv-open .nv-l{transform:none;transition:transform .8s var(--pop) calc(.38s + var(--r)*70ms + var(--i)*24ms)}

/* hover image (swap the tile for your <img> later) */
.nv-img{
  position:absolute;left:0;top:50%;width:var(--img);height:var(--img);margin-top:calc(var(--img) / -2 + .05rem);
  border-radius:14px;overflow:hidden;background:var(--lime);display:grid;place-items:center;pointer-events:none;
  transform:scale(0) rotate(-16deg);transition:transform .3s ease-in;box-shadow:0 8px 18px -6px rgba(0,0,0,.45);
}
.nv-img img{width:100%;height:100%;object-fit:cover;display:block}
.nv-img svg{width:62%;height:62%;display:block}
.nv-link:hover .nv-img,.nv-link:focus-visible .nv-img{transform:scale(1) rotate(-5deg);transition:transform .6s var(--pop)}

/* arrow: ↗ at rest, → on hover, pops in after the letters */
.nv-ar{
  flex:none;width:24px;height:24px;border-radius:50%;background:var(--lime);color:var(--ink);
  display:grid;place-items:center;transform:scale(0);transition:transform .2s ease-in;
}
.nv-open .nv-ar{transform:scale(1);transition:transform .7s var(--pop) calc(.8s + var(--r)*70ms)}
.nv-ar svg{width:11px;height:11px;transform:rotate(-45deg);transition:transform .45s var(--out)}
.nv-link:hover .nv-ar svg,.nv-link:focus-visible .nv-ar svg{transform:rotate(0deg)}
.nv-link[data-active="true"] .nv-ar{background:var(--ink);color:var(--lime)}

/* PULL ME tab: paper with torn zig-zag bottom */
.nv-tabwrap{justify-self:end;width:clamp(100px,26%,128px);filter:drop-shadow(0 10px 12px rgba(0,0,0,.28))}
.nv-tab{
  position:relative;display:block;width:100%;border:0;cursor:pointer;background:var(--cream);color:var(--ink);
  padding:1.05rem 0 1.65rem;font:inherit;
  clip-path:polygon(0 0,100% 0,100% calc(100% - 10px),91.6% 100%,83.3% calc(100% - 10px),75% 100%,66.6% calc(100% - 10px),58.3% 100%,50% calc(100% - 10px),41.6% 100%,33.3% calc(100% - 10px),25% 100%,16.6% calc(100% - 10px),8.3% 100%,0 calc(100% - 10px));
  transition:transform .5s var(--pop),background .25s;
}
.nv-tab::before{
  content:"";position:absolute;left:.75rem;right:.75rem;top:.6rem;height:4px;
  background-image:radial-gradient(circle,var(--ink) 1.1px,transparent 1.6px);background-size:6px 4px;background-repeat:repeat-x;
}
.nv-tab span{display:block;font-size:.95rem;letter-spacing:.03em;line-height:1;text-transform:uppercase}
.nv-tab:hover{transform:translateY(7px)}
.nv-tab:active{transform:translateY(12px);transition-duration:.15s}
.nv-tab:focus-visible{background:var(--lime);outline:none}

@media (prefers-reduced-motion:reduce){
  .nv *{transition-duration:.01ms !important;transition-delay:0s !important}
}
`;

/* little 8-point burst used as the placeholder hover tile */
function BurstTile() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 4 L58 36 L88 18 L68 44 L98 50 L68 56 L88 82 L58 64 L50 96 L42 64 L12 82 L32 56 L2 50 L32 44 L12 18 L42 36 Z"
        fill="none"
        stroke="#0B0B0C"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="M1 6h9.2M6.4 2.2 10.2 6l-3.8 3.8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Nav({ isVisible = true }: NavProps) {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname ?? "/";
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLButtonElement>(null);

  /* ── Nav theme detection ───────────────────────────────── */
  const [navTheme, setNavTheme] = useState<LogoTheme>("cream");
  const rafRef = useRef<number>(0);

  const detectTheme = useCallback(() => {
    const Y = 45; // sample point near vertical center of navbar (height 80px)
    const els = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
    let found: LogoTheme = "cream"; // default to cream for Hero section
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= Y && rect.bottom > Y) {
        found = (el.getAttribute("data-nav-theme") as LogoTheme) || "cream";
        break;
      }
    }
    setNavTheme((prev) => (prev === found ? prev : found));
  }, []);

  const isLightBackground = navTheme === "cream" || navTheme === "lime";

  /* Scroll listener — rAF-throttled, passive */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafRef.current = requestAnimationFrame(() => {
          detectTheme();
          ticking = false;
        });
      }
    };
    const onResize = () => detectTheme();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    // Initial check
    detectTheme();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [detectTheme]);

  /* Re-detect on route change */
  useEffect(() => {
    // Small delay to let the new page render its sections
    const t = setTimeout(detectTheme, 100);
    return () => clearTimeout(t);
  }, [currentPath, detectTheme]);

  /* close on route change */
  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  /* close on Esc / click outside (listeners only while open) */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        tabRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <header
      className="fixed inset-x-0 top-0 h-20 bg-transparent transition-opacity duration-700"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 9999,
        padding: "0 clamp(1.5rem, 3vw, 3rem)",
        opacity: isVisible ? 1 : 0,
        /* header strip itself no longer blocks the page underneath; only brand + menu are clickable */
        pointerEvents: "none",
      }}
    >
      <style>{css}</style>

      <div className="mx-auto flex h-full w-full items-center justify-between">
        
        {/* LEFT SIDE: ALTIMA LOCKUP (Using reusable Logo component) */}
        <div style={{ pointerEvents: isVisible ? "auto" : "none" }}>
          <Link
            to="/"
            aria-label="Altima – Home"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            <Logo theme={navTheme} size="md" />
          </Link>
        </div>

      </div>

      {/* RIGHT SIDE: paper menu hanging from the top edge */}
      <div
        ref={boxRef}
        className={`nv${open ? " nv-open" : ""}`}
        style={{
          position: "absolute",
          top: 0,
          right: "clamp(1.5rem, 3vw, 3rem)",
          pointerEvents: isVisible ? "auto" : "none",
        }}
      >
        <div className="nv-wrap">
          <div className="nv-clip" id="altima-menu">
            <nav aria-label="Main">
              <ul className="nv-list">
                {LINKS.map((link, r) => {
                  const isActive = currentPath === link.to;
                  return (
                    <li key={link.label} className="nv-row" style={{ "--r": r } as CSSProperties}>
                      <span className="nv-line" aria-hidden="true" />
                      <Link
                        to={link.to as any}
                        className="nv-link"
                        data-active={isActive}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={link.label}
                        tabIndex={open ? 0 : -1}
                        onClick={() => setOpen(false)}
                      >
                        <span className="nv-img" aria-hidden="true">
                          {link.img ? <img src={link.img} alt="" loading="lazy" /> : <BurstTile />}
                        </span>
                        <span className="nv-slide">
                          <span className="nv-mask" aria-hidden="true">
                            {Array.from(link.label).map((ch, i) => (
                              <span key={i} className="nv-l" style={{ "--i": i } as CSSProperties}>
                                {ch}
                              </span>
                            ))}
                          </span>
                        </span>
                        <span className="nv-ar" aria-hidden="true">
                          <ArrowIcon />
                        </span>
                      </Link>
                    </li>
                  );
                })}
                <li className="nv-row nv-end" aria-hidden="true" style={{ "--r": LINKS.length } as CSSProperties}>
                  <span className="nv-line" />
                </li>
              </ul>
            </nav>
          </div>

          <div className="nv-tabwrap">
            <button
              ref={tabRef}
              type="button"
              className="nv-tab"
              aria-expanded={open}
              aria-controls="altima-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span>PULL ME</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}