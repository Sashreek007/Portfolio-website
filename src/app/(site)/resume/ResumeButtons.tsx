export default function ResumeButtons() {
  return (
    <div className="flex gap-3">
      <a
        href="/Sashreek Addanki.pdf"
        download
        className="pill-primary font-mono text-[12px] px-4 py-2"
      >
        ↓ download
      </a>
      <a
        href="/Sashreek Addanki.pdf"
        target="_blank"
        rel="noreferrer noopener"
        className="glass-pill font-mono text-[12px] px-4 py-2"
        style={{ color: "var(--text-secondary)" }}
      >
        open in new tab ↗
      </a>
    </div>
  );
}
