import { forwardRef } from "react";

const Marquee = forwardRef<HTMLDivElement, { color: string }>(
  ({ color }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            display: "flex",
            animation: "marquee 30s linear infinite",
            willChange: "transform",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: '"Anton", sans-serif',
                fontSize: "clamp(32px, 4vw, 56px)",
                fontStyle: "italic",
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
                color: color,
                paddingRight: "48px",
                display: "inline-flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              OUR SERVICES
              <span style={{ fontSize: "0.5em", opacity: 0.7 }}>✦</span>
            </span>
          ))}
        </div>
      </div>
    );
  }
);

Marquee.displayName = "Marquee";
export default Marquee;
