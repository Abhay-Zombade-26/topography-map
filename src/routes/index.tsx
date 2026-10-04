import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/sections/Hero";
import HeroToAboutTransition from "@/components/sections/HeroToAboutTransition";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Altima — Software, Engineered for Founders Who Ship" },
      {
        name: "description",
        content:
          "Altima is a software studio for early-stage startup founders. We build bold products, engineered to ship.",
      },
      { property: "og:title", content: "Altima — Build Bold" },
      {
        property: "og:description",
        content:
          "A software studio for early-stage startup founders. Software, engineered for founders who ship.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="bg-[#EFEBE0]">
      <Hero />
      <HeroToAboutTransition />
      <About />
      <Services />
      <Work />
      <Testimonials />
      <Contact />
    </main>
  );
}
