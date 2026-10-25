import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Nav from "@/components/ui/Nav";
import About from "@/components/sections/About";
import TeamShowcase from "@/components/sections/TeamShowcase";

/* ═══════════════════════════════════════════════════════════════
   /about  — the full ABOUT PAGE (not the home-page section)

   About.tsx stays exactly as it is (the home-page section).
   This page re-uses it as the page intro, then shows the team.
   Route:  /about  →  <AboutPage />
   ═══════════════════════════════════════════════════════════════ */

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Altima" },
      { name: "description", content: "About Altima Software Studio for Founders Who Ship." },
      { property: "og:title", content: "About — Altima" },
      { property: "og:description", content: "About Altima Software Studio for Founders Who Ship." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  useEffect(() => {
    // new route → start at the top, then let ScrollTrigger re-measure
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <main style={{ backgroundColor: "#0B0B0C", minHeight: "100vh" }}>
      {/* Navbar stays fixed on top. It automatically detects the dark background 
          via data-nav-theme if you add it to sections, but defaults to dark styling here. */}
      <Nav isVisible={true} />

      {/* 1 · About intro (same animated section you use on the home page) */}
      <About />

      {/* 2 · Team: deck rises → shuffles → scatters → hover flips (role + LinkedIn) */}
      <TeamShowcase />

      {/* 3 · later: <Footer /> goes here */}
    </main>
  );
}