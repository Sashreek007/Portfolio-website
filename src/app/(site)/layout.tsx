import Nav from "@/components/site/Nav";
import ScrollControls from "@/components/site/ScrollControls";
import TrackPageView from "@/components/site/TrackPageView";
import AmbientField from "@/components/site/AmbientField";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AmbientField />
      <Nav />
      <TrackPageView />
      <main className="flex-1">{children}</main>
      <ScrollControls />
      <footer
        className="px-[6vw] py-6 font-mono text-[11px] flex justify-between flex-wrap gap-3"
        style={{
          color: "var(--text-muted)",
          borderTop: "1px solid var(--gray-800)",
        }}
      >
        <span>
          © 2026 Sashreek Addanki ·{" "}
          <a
            href="mailto:sashreek.addanki@gmail.com"
            className="transition-colors duration-150 hover:text-[var(--violet-soft)]"
          >
            sashreek.addanki@gmail.com
          </a>
        </span>
        <span className="flex items-center gap-4">
          <span style={{ color: "var(--gray-600)" }}>
            set in Geist Mono &amp; Syne
          </span>
          <span className="flex items-center gap-2">
            <span
              className="w-[5px] h-[5px] rounded-full inline-block"
              style={{ background: "var(--green-mid)" }}
            />
            edmonton, ab
          </span>
        </span>
      </footer>
    </>
  );
}
