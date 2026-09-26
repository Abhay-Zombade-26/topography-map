import { Link, useRouterState } from "@tanstack/react-router";

const LINKS = [
  { label: "HOME", to: "/" },
  { label: "ABOUT", to: "/about" },
  { label: "SERVICES", to: "/#services" },
  { label: "WORK", to: "/work" },
  { label: "CONTACT", to: "/contact" },
] as const;

interface NavProps {
  isVisible?: boolean;
}

export default function Nav({ isVisible = true }: NavProps) {
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname ?? "/";

  return (
    <header
      className="fixed inset-x-0 top-0 h-20 bg-transparent transition-opacity duration-700 pointer-events-auto"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 9999,
        padding: "0 clamp(1.5rem, 3vw, 3rem)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="mx-auto flex h-full w-full items-center justify-between">
        {/* LEFT SIDE: ALTIMA / SOFTWARE SOLUTIONS */}
        <div className="flex items-baseline gap-4">
          <Link
            to="/"
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: "1.5rem",
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
            className="text-[#111112] uppercase leading-none transition-opacity hover:opacity-80"
          >
            ALTIMA
          </Link>
          <span
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
            }}
            className="uppercase text-[#6B6B70] leading-none select-none"
          >
            / SOFTWARE SOLUTIONS
          </span>
        </div>

        {/* RIGHT SIDE: Navigation Links */}
        <nav>
          <ul
            style={{
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              fontWeight: 500,
            }}
            className="flex items-center gap-8 uppercase text-[#111112]"
          >
            {LINKS.map((link) => {
              const isHome = link.label === "HOME";
              const isActive =
                currentPath === link.to || (isHome && currentPath === "/");

              return (
                <li key={link.label} className="relative flex flex-col items-center">
                  <Link
                    to={link.to as any}
                    className="group relative inline-block text-[#111112] transition-colors duration-200 hover:text-[#D2FF00]"
                  >
                    {link.label}

                    {/* Fixed 24px lime underline for HOME */}
                    {isHome && (
                      <span
                        className="absolute left-0 h-[2px] w-[24px] bg-[#D2FF00] pointer-events-none"
                        style={{ bottom: "-4px" }}
                      />
                    )}

                    {/* Sliding hover underline from left */}
                    <span
                      className="absolute left-0 h-[2px] w-full origin-left scale-x-0 bg-[#D2FF00] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 pointer-events-none"
                      style={{ bottom: "-4px" }}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
