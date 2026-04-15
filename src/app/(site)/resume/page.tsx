import SectionLabel from "@/components/site/SectionLabel";
import ResumeButtons from "./ResumeButtons";

export const metadata = {
  title: "Resume | Sashreek Addanki",
};

export default function ResumePage() {
  return (
    <div className="px-[6vw] py-16 max-w-[1100px] mx-auto w-full">
      <SectionLabel>Resume</SectionLabel>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1
          className="text-[24px] font-medium"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          Sashreek Addanki
        </h1>
        <ResumeButtons />
      </div>

      <div
        className="w-full"
        style={{
          height: "min(85vh, 980px)",
          border: "1px solid var(--gray-800)",
          borderRadius: "8px",
          overflow: "hidden",
          background: "var(--bg-surface)",
        }}
      >
        <iframe
          src="/Sashreek Addanki.pdf"
          className="w-full h-full border-0"
          title="Sashreek Addanki — Resume"
        />
      </div>
    </div>
  );
}
