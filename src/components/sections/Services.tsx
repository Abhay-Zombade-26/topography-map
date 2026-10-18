import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import Marquee from "@/components/ui/Marquee";

// ═══════════════════════════════════════════════════════════════
// SERVICE DATA
// ═══════════════════════════════════════════════════════════════

const SERVICES = [
  {
    id: "01",
    title: "Mobile Development",
    tagline: "NATIVE / SMOOTH / OFFLINE-READY",
    image: "/services-img/mobile-dev.png",
  },
  {
    id: "02",
    title: "Website Development",
    tagline: "FAST / RESPONSIVE / BUILT TO LAST",
    image: "/services-img/website-dev.png",
  },
  {
    id: "03",
    title: "AI Solutions",
    tagline: "SMART / AUTOMATED / ACCURATE",
    image: "/services-img/AI.png",
  },
  {
    id: "04",
    title: "UI/UX Design",
    tagline: "CLEAR / INTUITIVE / HUMAN",
    image: "/services-img/UIUX.png",
  },
  {
    id: "05",
    title: "Custom Software",
    tagline: "BESPOKE / SCALABLE / ENGINEERED",
    image: "/services-img/custom-soft.png",
  },
  {
    id: "06",
    title: "Website Maintenance",
    tagline: "RELIABLE / MONITORED / UPDATED",
    image: "/services-img/web-maintenance.png",
  },
] as const;

type ServiceItem = (typeof SERVICES)[number];

// ═══════════════════════════════════════════════════════════════
// CARD — hover border thickens + darkens
// ═══════════════════════════════════════════════════════════════

interface ServiceCardProps {
  service: ServiceItem;
  theme?: "lime" | "black";
  style?: React.CSSProperties;
}

function ServiceCard({ service, theme = "lime", style = {} }: ServiceCardProps) {
  const [hovered, setHovered] = useState(false);
  const isBlack = theme === "black";
  const primaryColor = isBlack ? "#D2FF00" : "#111112";
  const mutedColor = isBlack ? "rgba(210,255,0,0.8)" : "rgba(17,17,17,0.75)";

  // Border colors
  const defaultBorder = isBlack
    ? "rgba(210,255,0,0.18)"
    : "rgba(17,17,17,0.14)";
  const hoverBorder = isBlack
    ? "rgba(210,255,0,0.75)"
    : "rgba(17,17,17,0.6)";

  // Inset shadow simulates a thicker inner border without any layout shift
  const hoverInsetShadow = isBlack
    ? "inset 0 0 0 1px rgba(210,255,0,0.75)"
    : "inset 0 0 0 1px rgba(17,17,17,0.6)";

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        padding: "clamp(1.25rem, 2vw, 2rem) clamp(1.25rem, 1.8vw, 2rem)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        backgroundColor: isBlack ? "#0A0A0C" : "#D2FF00",
        border: `1px solid ${hovered ? hoverBorder : defaultBorder}`,
        boxShadow: hovered ? hoverInsetShadow : "none",
        boxSizing: "border-box",
        minHeight: 0,
        height: "100%",
        transition:
          "border-color 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s cubic-bezier(0.22,1,0.36,1)",
        cursor: "pointer",
        ...style,
      }}
    >
      {/* TOP: index + plus */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "clamp(0.5rem, 0.9vw, 1rem)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: primaryColor,
          }}
        >
          [{service.id}]
        </span>
        <span
          style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: "20px",
            lineHeight: 1,
            color: primaryColor,
            transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
            transform: hovered ? "rotate(90deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          +
        </span>
      </div>

      {/* MIDDLE: title + image */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "clamp(0.75rem, 1.2vw, 1.25rem)",
          flex: 1,
          minHeight: 0,
        }}
      >
        <h3
          style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: "clamp(26px, 2.6vw, 42px)",
            lineHeight: 0.92,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            margin: 0,
            padding: 0,
            color: primaryColor,
            maxWidth: "50%",
            wordBreak: "normal",
            overflowWrap: "normal",
            hyphens: "none",
            flex: "0 0 50%",
          }}
        >
          {service.title}
        </h3>

        <div
          style={{
            flex: "1 1 50%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            minHeight: 0,
          }}
        >
          <img
            src={service.image}
            alt={service.title}
            style={{
              width: "100%",
              maxWidth: "clamp(180px, 18vw, 320px)",
              height: "auto",
              objectFit: "contain",
              animation: "float 5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* BOTTOM: tagline + CTA */}
      <div
        style={{
          marginTop: "clamp(0.5rem, 0.9vw, 1rem)",
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: "clamp(11px, 0.85vw, 12px)",
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: mutedColor,
            marginBottom: "clamp(0.5rem, 0.8vw, 0.75rem)",
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {service.tagline}
        </p>

        <a
          href="/contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: '"Anton", sans-serif',
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textDecoration: "none",
            color: primaryColor,
            cursor: "pointer",
          }}
        >
          <span>EXPLORE SERVICE</span>
          <span
            style={{
              display: "inline-block",
              width: hovered ? "38px" : "28px",
              height: "1px",
              background: primaryColor,
              transition: "width 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
          <span
            style={{
              display: "inline-block",
              transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
              transform: hovered ? "translateX(4px)" : "translateX(0)",
            }}
          >
            →
          </span>
        </a>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
// CARD WRAPPER
// ═══════════════════════════════════════════════════════════════

function CardWrapper({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        padding: "6px",
        minHeight: 0,
        display: "flex",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN SECTION
// ═══════════════════════════════════════════════════════════════

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.6,
  });

  const drawerY = useTransform(smooth, [0.1, 0.7], ["92%", "0%"]);
  const marqueeBottom = useTransform(smooth, [0.4, 0.8], [100, 0]);
  const marqueeClip = useMotionTemplate`inset(0% 33.333% ${marqueeBottom}% 33.333%)`;
  const cardsOpacity = useTransform(smooth, [0.25, 0.6], [0.3, 1]);
  const cardsY = useTransform(smooth, [0.25, 0.6], [16, 0]);

  const disableAnim = prefersReduced || isMobile;

  const drawerStyle = disableAnim
    ? { transform: "translateY(0%)" }
    : { y: drawerY };

  const marqueeStyle = disableAnim
    ? { clipPath: "inset(0% 33.333% 0% 33.333%)" }
    : { clipPath: marqueeClip };

  const cardsStyle = disableAnim ? {} : { opacity: cardsOpacity, y: cardsY };

  return (
    <section
      id="services"
      ref={sectionRef}
      style={{
        position: "relative",
        background: "#D2FF00",
        width: "100%",
        height: isMobile ? "auto" : "150vh",
      }}
    >
      <div
        style={{
          position: isMobile ? "relative" : "sticky",
          top: 0,
          height: isMobile ? "auto" : "100vh",
          width: "100%",
          paddingTop: "64px",
          paddingLeft: "12px",
          paddingRight: "12px",
          paddingBottom: "12px",
          background: "#D2FF00",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          overflow: "visible",
          zIndex: 20,
        }}
      >
        {/* ── MARQUEE ── */}
        <div
          style={{
            position: "relative",
            height: "52px",
            flexShrink: 0,
            background: "#D2FF00",
            overflow: "hidden",
            zIndex: 30,
          }}
        >
          <Marquee color="#6B7FBF" />

          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "#0A0A0C",
              willChange: "clip-path",
              zIndex: 25,
              pointerEvents: "none",
              ...marqueeStyle,
            }}
          >
            <Marquee color="#D2FF00" />
          </motion.div>
        </div>

        {/* ── GRID ── */}
        {isMobile ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              marginTop: "6px",
            }}
          >
            {SERVICES.map((service) => (
              <CardWrapper key={service.id} style={{ minHeight: "45vh" }}>
                <ServiceCard
                  service={service}
                  theme={
                    service.id === "02" || service.id === "05" ? "black" : "lime"
                  }
                  style={{ flex: 1 }}
                />
              </CardWrapper>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 0,
              flex: 1,
              minHeight: 0,
              marginTop: "6px",
              position: "relative",
              zIndex: 1,
              overflow: "hidden",
            }}
          >
            {/* Column 1 — [01] Mobile Dev, [04] UI/UX Design */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <CardWrapper style={{ flex: 1, minHeight: 0 }}>
                <ServiceCard
                  service={SERVICES[0]}
                  theme="lime"
                  style={{ flex: 1 }}
                />
              </CardWrapper>
              <CardWrapper style={{ flex: 1, minHeight: 0 }}>
                <ServiceCard
                  service={SERVICES[3]}
                  theme="lime"
                  style={{ flex: 1 }}
                />
              </CardWrapper>
            </div>

            {/* Column 2 — [02] Website Dev, [05] Custom Software */}
            <div
              style={{
                position: "relative",
                minHeight: 0,
              }}
            >
              <motion.div
                style={{
                  position: "absolute",
                  top: "-30px",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "#0A0A0C",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  zIndex: 10,
                  willChange: "transform",
                  ...drawerStyle,
                }}
              >
                <motion.div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    paddingTop: "30px",
                    ...cardsStyle,
                  }}
                >
                  <CardWrapper style={{ flex: 1, minHeight: 0 }}>
                    <ServiceCard
                      service={SERVICES[1]}
                      theme="black"
                      style={{ flex: 1 }}
                    />
                  </CardWrapper>
                  <CardWrapper style={{ flex: 1, minHeight: 0 }}>
                    <ServiceCard
                      service={SERVICES[4]}
                      theme="black"
                      style={{ flex: 1 }}
                    />
                  </CardWrapper>
                </motion.div>
              </motion.div>
            </div>

            {/* Column 3 — [03] AI Solutions, [06] Website Maintenance */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <CardWrapper style={{ flex: 1, minHeight: 0 }}>
                <ServiceCard
                  service={SERVICES[2]}
                  theme="lime"
                  style={{ flex: 1 }}
                />
              </CardWrapper>
              <CardWrapper style={{ flex: 1, minHeight: 0 }}>
                <ServiceCard
                  service={SERVICES[5]}
                  theme="lime"
                  style={{ flex: 1 }}
                />
              </CardWrapper>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div
          style={{
            height: "44px",
            flexShrink: 0,
            marginTop: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 8px",
            position: "relative",
            zIndex: 40,
          }}
        >
          <div
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#111112",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>+</span>
            <span>BUILD / LAUNCH / GROW</span>
            <span
              style={{
                display: "inline-block",
                width: "28px",
                height: "1px",
                background: "#111112",
              }}
            />
          </div>

          <div
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: "11px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#111112",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>ALTIMA / 2025</span>
            <span>+</span>
          </div>
        </div>

        {/* ── STICKY SECTION CURVE TRANSITION (LIME ARC ROLLING UP OVER PROCESS) ── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-1px",
            left: 0,
            right: 0,
            height: "120px",
            transform: "translateY(100%)",
            pointerEvents: "none",
            zIndex: 40,
            overflow: "hidden",
          }}
        >
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <path
              d="M0,0 L1440,0 L1440,20 Q720,120 0,20 Z"
              fill="#D2FF00"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}