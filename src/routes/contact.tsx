import { createFileRoute } from "@tanstack/react-router";
import Nav from "@/components/ui/Nav";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Altima" },
      { name: "description", content: "Get in touch with Altima Software Solution." },
      { property: "og:title", content: "Contact — Altima" },
      { property: "og:description", content: "Get in touch with Altima Software Solution." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main className="bg-ink-900">
      <Nav />
      <div className="flex h-screen items-center justify-center">
        <p className="font-serif text-2xl italic text-paper/60">Contact — coming soon</p>
      </div>
    </main>
  );
}
