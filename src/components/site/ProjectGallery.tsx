import type { GalleryItem } from "@/components/site/ProjectCard";

// Ordered figure plates for a project's detail page. Layout only: every
// string rendered here comes from the project record, so a project with an
// empty gallery renders nothing and no copy change reaches this file.

export default function ProjectGallery({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="font-mono text-[14px] mb-5 flex items-baseline gap-2">
        <span style={{ color: "var(--violet-soft)" }}>##</span>
        <span style={{ color: "var(--text-primary)" }}>gallery</span>
      </h2>

      <div className="flex flex-col gap-8">
        {items.map((item, i) => (
          <figure
            key={item.url}
            className="w-full overflow-hidden"
            style={{
              border: "1px solid var(--gray-800)",
              borderRadius: "8px",
              background: "var(--bg-surface)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              className="block w-full h-auto"
            />
            {item.caption && (
              <figcaption
                className="flex items-baseline gap-3 px-5 py-4"
                style={{ borderTop: "1px solid var(--gray-800)" }}
              >
                <span
                  className="font-mono text-[11px] tracking-[0.18em] shrink-0"
                  style={{ color: "var(--amber-bright)" }}
                >
                  {`FIG ${String(i + 1).padStart(2, "0")}`}
                </span>
                <span
                  className="text-[14px] leading-[1.6]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.caption}
                </span>
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
