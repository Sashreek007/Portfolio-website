import Nav from "@/components/site/Nav";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <footer
        className="px-[6vw] py-6 font-mono text-[11px] flex justify-between flex-wrap gap-3"
        style={{
          color: "var(--text-muted)",
          borderTop: "1px solid var(--gray-800)",
        }}
      >
        <span>© 2026 Sashreek Addanki</span>
        <span
          style={{ color: "var(--text-muted)" }}
          className="flex items-center gap-2"
        >
          <span
            className="w-[5px] h-[5px] rounded-full inline-block"
            style={{ background: "var(--green-mid)" }}
          />
          edmonton, ab
        </span>
      </footer>
    </>
  );
}
