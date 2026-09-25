import { createFileRoute } from "@tanstack/react-router";
import Nav from "@/components/ui/Nav";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Altima" },
      { name: "description", content: "About Altima Software Solution." },
      { property: "og:title", content: "About — Altima" },
      { property: "og:description", content: "About Altima Software Solution." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="bg-ink-900">
      <Nav />
      <div className="flex h-screen items-center justify-center">
        <p className="font-serif text-2xl italic text-paper/60">About — coming soon</p>
      </div>
    </main>
  );
}
