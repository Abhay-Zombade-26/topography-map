import { createFileRoute } from "@tanstack/react-router";
import Nav from "@/components/ui/Nav";
import About from "@/components/sections/About";

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
  return (
    <main className="bg-[#D2FF00] min-h-screen">
      <Nav isVisible={true} />
      <About />
    </main>
  );
}
