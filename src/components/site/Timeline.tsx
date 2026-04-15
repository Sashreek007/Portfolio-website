type TimelineItem = {
  period: string;
  role: string;
  org: string;
  details: string[];
  isCurrent?: boolean;
};

const items: TimelineItem[] = [
  {
    period: "Sept 2025 – Present",
    role: "Software Engineer (Project Lead)",
    org: "Undergraduate Artificial Intelligence Society",
    details: [
      "Leading ClubMate AI — open-source club automation with LangChain, LangGraph, and MCP.",
      "Deployed a spam/scam detection Discord bot with a fine-tuned Hugging Face model.",
      "Built the message-processing pipeline with Python and Discord.py for 24/7 operation.",
    ],
    isCurrent: true,
  },
  {
    period: "Sept 2025 – Dec 2025",
    role: "Teaching Assistant — CMPUT 274",
    org: "University of Alberta",
    details: [
      "Mentored 200+ students in Linux, bash, and Python data structures.",
      "Taught functional programming concepts through labs and office hours.",
      "Supported assignments with office hours and code review sessions.",
    ],
  },
  {
    period: "Jan 2025",
    role: "natHacks Participant — EcoTech Challenge",
    org: "natHacks Hackathon",
    details: [
      "Built FluxAtlas — an international resource trading simulation with a Vickrey auction engine.",
      "Full-stack: FastAPI backend, React frontend, PostgreSQL, Python + C++ order engine.",
    ],
  },
];

export default function Timeline() {
  return (
    <div className="relative pl-7">
      {/* Vertical rail */}
      <div
        className="absolute left-[9px] top-0 bottom-0 w-[1px]"
        style={{ background: "var(--gray-800)" }}
      />

      <div className="flex flex-col gap-8">
        {items.map((item, i) => (
          <div key={i} className="relative">
            {/* Dot */}
            <div
              className="absolute -left-[22px] top-[6px] w-[6px] h-[6px] rounded-full"
              style={{
                background: item.isCurrent ? "var(--green-mid)" : "var(--violet-mid)",
                animation: item.isCurrent ? "pulse-dot 2.5s ease-in-out infinite" : undefined,
              }}
            />

            {/* Period */}
            <p
              className="font-mono text-[12px] mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              {item.period}
            </p>

            {/* Role */}
            <p
              className="text-[15px] font-medium mb-[2px]"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
              }}
            >
              {item.role}
            </p>

            {/* Org */}
            <p
              className="text-[13px] mb-2"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}
            >
              {item.org}
            </p>

            {/* Details */}
            <ul className="flex flex-col gap-1">
              {item.details.map((d, j) => (
                <li
                  key={j}
                  className="text-[13px] leading-[1.65] pl-3 relative"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span
                    className="absolute left-0 top-[8px] w-[4px] h-[4px] rounded-full"
                    style={{ background: "var(--gray-600)" }}
                  />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
