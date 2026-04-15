export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase mb-6"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </p>
  );
}
