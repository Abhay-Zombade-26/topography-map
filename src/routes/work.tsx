import { createFileRoute } from "@tanstack/react-router";
import Nav from "@/components/ui/Nav";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work — Altima" },
      { name: "description", content: "Selected work by Altima Software Solution." },
      { property: "og:title", content: "Work — Altima" },
      { property: "og:description", content: "Selected work by Altima Software Solution." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <main className="bg-ink-900">
      <Nav />
      <div className="flex h-screen items-center justify-center">
        <p className="font-serif text-2xl italic text-paper/60">Work — coming soon</p>
      </div>
    </main>
  );
}
