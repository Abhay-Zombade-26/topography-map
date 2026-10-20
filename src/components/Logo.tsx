import type { CSSProperties } from "react";

export type LogoTheme = "dark" | "lime" | "cream";
export type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  theme?: LogoTheme;
  size?: LogoSize;
}

const SIZES: Record<LogoSize, { mark: number; word: string; tag: string; lockup: number }> = {
  sm: { mark: 38, word: "1.2rem", tag: "0.5rem", lockup: 40 },
  md: { mark: 52, word: "1.55rem", tag: "0.6rem", lockup: 54 },
  lg: { mark: 68, word: "2.1rem",  tag: "0.7rem", lockup: 70 },
};

const COLOR_TRANSITION = "color 0.4s cubic-bezier(.16,1,.3,1), background 0.4s cubic-bezier(.16,1,.3,1), filter 0.4s cubic-bezier(.16,1,.3,1), opacity 0.4s cubic-bezier(.16,1,.3,1)";

const LOGO_CSS = `
.logo-lockup:hover .logo-letter,
.logo-lockup:focus-visible .logo-letter {
  transform: translateY(-2px);
}
.logo-lockup:hover .logo-chip,
.logo-lockup:focus-visible .logo-chip {
  transform: rotate(-8deg) scale(1.08) translateY(-4px); /* Keep translateY on hover */
}
.logo-chip {
  transition: transform 0.45s cubic-bezier(.34,1.56,.64,1), ${COLOR_TRANSITION};
}
.logo-letter {
  display: inline-block;
  transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), color 0.4s cubic-bezier(.16,1,.3,1);
}
.logo-lockup:focus-visible {
  outline: none;
  border-radius: 8px;
}
.logo-lockup[data-theme="dark"]:focus-visible {
  box-shadow: 0 0 0 2px #D2FF00;
}
.logo-lockup[data-theme="lime"]:focus-visible,
.logo-lockup[data-theme="cream"]:focus-visible {
  box-shadow: 0 0 0 2px #0B0B0C;
}
@media (max-width: 379px) {
  .logo-tagline { display: none !important; }
}
@media (max-width: 480px) {
  .logo-lockup { transform: scale(0.88); transform-origin: left center; }
}
@media (prefers-reduced-motion: reduce) {
  .logo-lockup:hover .logo-letter,
  .logo-lockup:focus-visible .logo-letter { transform: none !important; }
  .logo-lockup:hover .logo-chip,
  .logo-lockup:focus-visible .logo-chip { transform: none !important; }
  .logo-chip { transition: none !important; }
  .logo-letter { transition: color 0s !important; }
}
`;

export default function Logo({ theme = "lime", size = "md" }: LogoProps) {
  const s = SIZES[size];
  const isDark = theme === "dark";

  const textColor = isDark ? "#EFEBE0" : "#0B0B0C";
  const tagColor  = isDark ? "rgba(239,235,224,0.85)" : "rgba(11,11,12,0.85)";
  const markFilter = isDark
    ? "drop-shadow(0 0 14px rgba(210,255,0,.35))"
    : "none";

  const letters = "ltima".split("");

  return (
    <>
      <style>{LOGO_CSS}</style>
      <div
        className="logo-lockup"
        data-theme={theme}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0,
          height: s.lockup,
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        {/* ── MARK ── */}
        <div
          className="logo-chip"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: s.mark,
            height: s.mark,
            background: "transparent",
            flexShrink: 0,
            transition: COLOR_TRANSITION,
            transform: "translateY(-4px)", // Nudge up to align baseline
          }}
        >
          <img
            src={isDark ? "/logo-128.webp" : "/logo-black.webp"}
            alt="Altima"
            width={s.mark}
            height={s.mark}
            loading="eager"
            fetchPriority="high"
            style={{
              display: "block",
              width: s.mark,
              height: s.mark,
              objectFit: "contain",
              filter: markFilter,
              transition: COLOR_TRANSITION,
            }}
          />
        </div>

        {/* ── TEXT BLOCK ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: s.mark,
            marginLeft: -6, // Slightly closer
          }}
        >
          {/* "ltima" wordmark */}
          <span
            aria-hidden="true"
            style={{
              fontFamily: '"Outfit", "Poppins", system-ui, sans-serif',
              fontWeight: 800,
              fontSize: s.word,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: textColor,
              display: "inline-flex",
              transition: COLOR_TRANSITION,
            }}
          >
            {letters.map((ch, i) => (
              <span
                key={i}
                className="logo-letter"
                style={{
                  "--logo-delay": `${i * 25}ms`,
                  transitionDelay: "var(--logo-delay)",
                  color: textColor,
                } as CSSProperties}
              >
                {ch}
              </span>
            ))}
          </span>

          {/* Tagline */}
          <span
            className="logo-tagline"
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontWeight: 600,
              fontSize: s.tag,
              letterSpacing: "0.35em",
              lineHeight: 1,
              textTransform: "uppercase" as const,
              color: tagColor,
              marginTop: 2,
              opacity: 0.85,
              transition: COLOR_TRANSITION,
              whiteSpace: "nowrap",
            }}
          >
            SOFTWARE SOLUTIONS
          </span>
        </div>
      </div>
    </>
  );
}