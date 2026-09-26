import {
  motion,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface ScrollWatchProps {
  handRotation?: MotionValue<number>;
  scale?: MotionValue<number>;
  dialRotation?: MotionValue<number>;
  orbitAngle?: MotionValue<number>;
  orbitDotScale?: MotionValue<number>;
  orbitDotOpacity?: MotionValue<number>;
  orbitDotYOffset?: MotionValue<number>;
  labelOpacity?: MotionValue<number>;
  loadProgress?: number;
  isLoaded?: boolean;
}

const TICKS = Array.from({ length: 12 }, (_, i) => i);
const ORBIT_RADIUS = 98; // px from watch center, matches tick mark radius

export default function ScrollWatch({
  handRotation,
  scale,
  dialRotation,
  orbitAngle,
  orbitDotScale,
  orbitDotOpacity,
  orbitDotYOffset,
  labelOpacity,
  loadProgress = 100,
  isLoaded = true,
}: ScrollWatchProps) {
  /* ---------- orbit dot x / y from angle ---------- */
  const baseOrbitX = useTransform(
    orbitAngle ?? ({ get: () => 60 } as MotionValue<number>),
    (a: number) => Math.sin((a * Math.PI) / 180) * ORBIT_RADIUS
  );
  const baseOrbitY = useTransform(
    orbitAngle ?? ({ get: () => 60 } as MotionValue<number>),
    (a: number) => -Math.cos((a * Math.PI) / 180) * ORBIT_RADIUS
  );

  const fallbackYOffset = { get: () => 0 } as MotionValue<number>;
  const activeYOffset = orbitDotYOffset ?? fallbackYOffset;

  const finalOrbitY = useTransform(
    [baseOrbitY, activeYOffset],
    (values: number[]) => {
      const by = values[0] ?? 0;
      const yOff = values[1] ?? 0;
      return by + yOff;
    }
  );

  return (
    <motion.div
      style={{
        position: "relative",
        width: "220px",
        height: "220px",
        borderRadius: "50%",
        backgroundColor: "#F5F2E9",
        border: "1px solid rgba(17, 17, 17, 0.15)",
        ...(scale ? { scale } : {}),
        pointerEvents: "none",
        userSelect: "none",
        overflow: "visible",
      }}
    >
      {/* ── Rotating dial container (ticks rotate counter-clockwise) ── */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          rotate: dialRotation ?? 0,
        }}
      >
        {TICKS.map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "1px",
              height: i % 3 === 0 ? "12px" : "8px",
              backgroundColor:
                i % 3 === 0
                  ? "rgba(17, 17, 17, 0.55)"
                  : "rgba(17, 17, 17, 0.3)",
              transformOrigin: "center center",
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-${ORBIT_RADIUS}px)`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Central hand with tip dot ── */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "1.5px",
          height: "94px",
          transformOrigin: "50% 100%",
          rotate: handRotation ?? 60,
          x: "-50%",
          y: "-100%",
        }}
      >
        {/* Tapered hand line */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(to top, #111112 0%, #111112 60%, #333 100%)",
          }}
        />
        {/* Small ink dot at tip of hand */}
        <div
          style={{
            position: "absolute",
            top: -3,
            left: "50%",
            transform: "translateX(-50%)",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#111112",
          }}
        />
      </motion.div>

      {/* ── Orbit dot — the interactive lime dot on the perimeter ── */}
      {/* Zero expansion in Hero: scale stays strictly 1 */}
      <motion.div
        style={{
          position: "absolute",
          top: "calc(50% - 9px)",
          left: "calc(50% - 9px)",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "#D2FF00",
          border: "1.5px solid #111112",
          x: baseOrbitX,
          y: finalOrbitY,
          scale: orbitDotScale ?? 1,
          opacity: isLoaded ? (orbitDotOpacity ?? 1) : 0,
          transformOrigin: "center bottom",
          zIndex: 26,
          boxShadow: "0 0 10px 2px rgba(210, 255, 0, 0.4)",
        }}
      />

      {/* ── Center pivot & Preloader Countdown / Dial Label ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {/* Center pivot */}
        {isLoaded && (
          <div
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: "#111112",
              marginBottom: "3px",
            }}
          />
        )}

        {/* Numeric countdown (0% to 100%) during preloader, then sleek 01 — ALTIMA */}
        {!isLoaded ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                fontFamily: '"Anton", sans-serif',
                color: "#111112",
                fontSize: "32px",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
              }}
            >
              <span>{loadProgress}</span>
              <span
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: "13px",
                  fontWeight: 700,
                  marginLeft: "2px",
                  color: "#6B6B70",
                }}
              >
                %
              </span>
            </div>
            <span
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: "6.5px",
                fontWeight: 600,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#6B6B70",
                marginTop: "3px",
                whiteSpace: "nowrap",
              }}
            >
              LOADING ALTIMA
            </span>
          </div>
        ) : (
          <motion.span
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#111112",
              whiteSpace: "nowrap",
            }}
          >
            01 — ALTIMA
          </motion.span>
        )}
      </div>

      {/* ── Text label under the dial ── */}
      <motion.div
        style={{
          position: "absolute",
          top: "calc(100% + 20px)",
          left: "50%",
          x: "-50%",
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: "10px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(17, 17, 17, 0.5)",
          whiteSpace: "nowrap",
          opacity: isLoaded ? (labelOpacity ?? 1) : 0,
        }}
      >
        SCROLL TO EXPLORE
      </motion.div>
    </motion.div>
  );
}
