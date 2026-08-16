// Roles, newest first. Content lives here rather than in Supabase because
// it changes on the scale of semesters, not weeks, and nothing in /admin
// edits it. Wording is lifted from the résumé so the two never disagree.

export type Role = {
  org: string;
  title: string;
  location: string;
  period: string;
  current: boolean;
  /** Logo file, or null to fall back to the monogram tile. */
  logo: string | null;
  /** Two-or-three character stand-in when there is no logo. */
  monogram: string;
  bullets: string[];
};

export const EXPERIENCE: Role[] = [
  {
    org: "Undergraduate Artificial Intelligence Club",
    title: "Project Lead and Software Engineer",
    location: "Edmonton, AB",
    period: "Sept 2025 — Present",
    current: true,
    logo: "/logos/uais.png",
    monogram: "UAIS",
    bullets: [
      "Shipped two internal automation tools for the club's ~1,000-member Discord server — one solo, one leading a 4-contributor team.",
      "Cut server spam from roughly daily to about once a month with a Python/discord.py moderation bot that auto-deletes scam and phishing on send and flags offenders to moderators, via a two-path detector: a pretrained Hugging Face RoBERTa classifier and a ~35-rule custom regex engine.",
      "Led ClubMate AI, a Discord club-admin assistant built on a hand-rolled Gemini agent loop calling ~21 tools across 5 MCP servers, with LangChain/ChromaDB RAG and a 287-test CI suite.",
    ],
  },
  {
    org: "University of Alberta",
    title: "Teaching Assistant",
    location: "Edmonton, AB",
    period: "Sept 2025 — Dec 2025",
    current: false,
    // Shield only: the wordmark under it is unreadable at 46px and just
    // repeats the org name printed beside the mark.
    logo: "/logos/ualberta.png",
    monogram: "UA",
    bullets: [
      "Ran weekly help sessions and 1:1 code reviews for 200+ students, and authored practice exam problems on Python data structures, recursion, OOP and Big-O analysis.",
      "Shortened per-assignment grading from 2–4 days to about 1 day by building Python auto-grading scripts adopted by the TA team.",
    ],
  },
];
