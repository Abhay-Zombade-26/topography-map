import React from "react";
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  type MotionValue,
} from "framer-motion";

export interface ScrollWatchProps {
  minuteHandRotation?: MotionValue<number>;
  orbitDotX?: MotionValue<number>;
  orbitDotY?: MotionValue<number>;
  orbitDotYExit?: MotionValue<number>;
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
const ORBIT_RADIUS = 98;

export default function ScrollWatch({
  minuteHandRotation,
  orbitDotX,
  orbitDotY,
  orbitDotYExit,
  handRotation,
  scale,
  dialRotation,
  orbitDotScale,
  orbitDotOpacity,
  orbitDotYOffset,
  labelOpacity,
  loadProgress = 100,
  isLoaded = true,
}: ScrollWatchProps) {
  /* ---------- SECOND HAND — real-time continuous sweep ---------- */
  const secondRotation = useMotionValue(0);
  useAnimationFrame(() => {
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    secondRotation.set(s * 6);
  });

  const activeHandRotation = minuteHandRotation ?? handRotation ?? 0;
  const activeDotYExit = orbitDotYExit ?? orbitDotYOffset;

  return (
    <motion.div
      aria-hidden="true"
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
      {/* ── Ticks ── */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          rotate: dialRotation ?? 0,
          transformOrigin: "center center",
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

      {/* ── HOUR HAND — bold, fixed at 10 o'clock ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "4px",
          height: "68px",
          transformOrigin: "50% 56px",
          transform: "translate(-50%, -56px) rotate(300deg)",
          zIndex: 20,
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "12px",
            backgroundColor: "#111112",
            borderRadius: "2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "56px",
            backgroundColor: "#111112",
            borderRadius: "2px",
          }}
        />
      </div>

      {/* ── MINUTE / SCROLL HAND ── */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "2.5px",
          height: "104px",
          transformOrigin: "50% 90px",
          x: "-50%",
          y: "-90px",
          rotate: activeHandRotation,
          zIndex: 21,
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "14px",
            backgroundColor: "#111112",
            borderRadius: "2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "90px",
            backgroundColor: "#111112",
            borderRadius: "2px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-4px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#111112",
          }}
        />
      </motion.div>

      {/* ── SECOND HAND — thin, subtle, always sweeping ── */}
      {/* Shaft: 80px above pivot | Tail: 12px below pivot */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "1px",
          height: "92px",
          transformOrigin: "50% 80px",
          x: "-50%",
          y: "-80px",
          rotate: secondRotation,
          zIndex: 22,
        }}
      >
        {/* counterweight tail — SHORT, stays inside dial */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "12px",
            backgroundColor: "rgba(17, 17, 17, 0.45)",
          }}
        />
        {/* main shaft — 80px, thin */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "80px",
            backgroundColor: "rgba(17, 17, 17, 0.45)",
          }}
        />
        {/* tiny tip dot */}
        <div
          style={{
            position: "absolute",
            top: "-2px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "3px",
            height: "3px",
            borderRadius: "50%",
            backgroundColor: "rgba(17, 17, 17, 0.45)",
          }}
        />
      </motion.div>

      {/* ── LIME ORBIT DOT ── */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          y: activeDotYExit ?? 0,
          pointerEvents: "none",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: "calc(50% - 9px)",
            left: "calc(50% - 9px)",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "#D2FF00",
            x: orbitDotX ?? 84.87,
            y: orbitDotY ?? -49,
            scale: orbitDotScale ?? 1,
            opacity: isLoaded ? (orbitDotOpacity ?? 1) : 0,
            transformOrigin: "center center",
            zIndex: 26,
          }}
        />
      </motion.div>

      {/* ── Center pivot cap ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: "#111112",
          zIndex: 28,
          pointerEvents: "none",
        }}
      />

      {/* ── Inner highlight dot on pivot ── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "3px",
          height: "3px",
          borderRadius: "50%",
          backgroundColor: "#F5F2E9",
          zIndex: 29,
          pointerEvents: "none",
        }}
      />

      {/* ── Preloader progress ── */}
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            top: "calc(50% + 28px)",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 27,
            pointerEvents: "none",
            userSelect: "none",
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
                color: "#4A4A4D",
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
              color: "#4A4A4D",
              marginTop: "3px",
              whiteSpace: "nowrap",
            }}
          >
            LOADING ALTIMA
          </span>
        </div>
      )}

      {/* ── Label below dial ── */}
      <motion.div
        style={{
          position: "absolute",
          top: "calc(100% + 26px)",
          left: "50%",
          x: "-50%",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "999px",
          backgroundColor: "#D2FF00",
          color: "#111112",
          fontFamily: '"Inter", system-ui, sans-serif',
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          opacity: isLoaded ? (labelOpacity ?? 1) : 0,
          boxShadow: "0 4px 16px rgba(210, 255, 0, 0.35)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#111112",
          }}
        />
        FREE DEMO IN 2 HRS
      </motion.div>
    </motion.div>
  );
}