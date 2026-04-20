import { Suspense } from "react";
import Nav from "@/components/site/Nav";
import ScrollControls from "@/components/site/ScrollControls";
import TrackPageView from "@/components/site/TrackPageView";
import ProjectModalProvider from "@/components/site/ProjectModalProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ProjectModalProvider>
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
      </ProjectModalProvider>
    </Suspense>
  );
}
