"use client";

export default function ResumeButtons() {
  const btnBase = {
    borderRadius: "4px",
    transition: "border-color 200ms, color 200ms, transform 200ms",
  } as const;

  return (
    <div className="flex gap-3">
      <a
        href="/Sashreek Addanki.pdf"
        download
        className="font-mono text-[12px] px-4 py-2"
        style={{ ...btnBase, color: "var(--text-primary)", border: "1px solid var(--gray-800)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor =
            "color-mix(in srgb, var(--violet-soft) 60%, transparent)";
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--gray-800)";
          (e.currentTarget as HTMLAnchorElement).style.transform = "";
        }}
      >
        ↓ download
      </a>
      <a
        href="/Sashreek Addanki.pdf"
        target="_blank"
        rel="noreferrer noopener"
        className="font-mono text-[12px] px-4 py-2"
        style={{ ...btnBase, color: "var(--text-muted)", border: "1px solid var(--gray-800)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor =
            "color-mix(in srgb, var(--violet-soft) 60%, transparent)";
          (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--gray-800)";
          (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
          (e.currentTarget as HTMLAnchorElement).style.transform = "";
        }}
      >
        open in new tab ↗
      </a>
    </div>
  );
}
