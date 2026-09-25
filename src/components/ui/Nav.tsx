import { Link } from "@tanstack/react-router";

const LINKS = [
  { label: "HOME", to: "/" },
  { label: "ABOUT", to: "/about" },
  { label: "WORK", to: "/work" },
  { label: "CONTACT", to: "/contact" },
] as const;

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 bg-transparent">
      <nav className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 md:px-10">
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-[-0.02em] text-paper"
        >
          ALTIMA
        </Link>
        <ul className="flex items-center gap-6 md:gap-10">
          {LINKS.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="group relative font-display text-sm uppercase tracking-[0.15em] text-paper/70 transition-colors duration-300 hover:text-lime-500"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-lime-500 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
