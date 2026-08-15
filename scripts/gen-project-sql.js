// Emits the Supabase apply script straight from src/lib/projects.ts so the
// SQL and the seed fallback can never drift apart.
const fs = require("fs");
const path = require("path");

const REPO = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(REPO, "src/lib/projects.ts"), "utf8");

// Strip the TS-only bits: imports and the two helper fns at the bottom.
const body = src
  .replace(/^import[\s\S]*?;\s*$/gm, "")
  .replace(/export const SEED_PROJECTS: Project\[\] =/, "const SEED_PROJECTS =")
  .replace(/export function[\s\S]*$/, "");

const SEED_PROJECTS = new Function(`${body}; return SEED_PROJECTS;`)();

const q = (s) => (s === null || s === undefined ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const arr = (a) =>
  a.length === 0 ? "'{}'" : `ARRAY[${a.map(q).join(",")}]::text[]`;
const json = (o) => `${q(JSON.stringify(o))}::jsonb`;

const ALL = SEED_PROJECTS;

let out = `-- Adds the two flagship projects and re-orders the grid.
-- Idempotent: safe to run more than once. Matched on name, so the existing
-- rows keep their UUIDs and anything referencing them (posts.project_id).
--
-- Run in the Supabase SQL editor for project sashreek-addanki.

BEGIN;

-- 1. Columns ---------------------------------------------------------------
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_gallery_is_array;
ALTER TABLE projects
  ADD CONSTRAINT projects_gallery_is_array
  CHECK (jsonb_typeof(gallery) = 'array');
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS highlights TEXT[] NOT NULL DEFAULT '{}';

-- 2. Every project, in repo order ------------------------------------------
`;

for (const p of ALL) {
  // `name` has no unique index, so guard the insert explicitly — ON CONFLICT
  // would not fire and a second run would duplicate the row.
  out += `
INSERT INTO projects (name, description, sort_order)
SELECT ${q(p.name)}, ${q(p.description)}, ${p.sort_order}
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = ${q(p.name)});

UPDATE projects SET
  description = ${q(p.description)},
  github_url  = ${q(p.github_url)},
  demo_url    = ${q(p.demo_url)},
  image_url   = ${q(p.image_url)},
  video_url   = ${q(p.video_url)},
  gallery     = ${json(p.gallery)},
  highlights  = ${arr(p.highlights)},
  stack       = ${arr(p.stack)},
  status      = ${q(p.status)},
  year        = ${p.year},
  is_best     = ${p.is_best},
  is_current  = ${p.is_current},
  sort_order  = ${p.sort_order}
WHERE name = ${q(p.name)};
`;
}

out += `
COMMIT;

-- Check:
-- SELECT sort_order, name, jsonb_array_length(gallery) AS figures,
--        array_length(highlights, 1) AS highlights
-- FROM projects ORDER BY sort_order;
`;

fs.writeFileSync(path.join(REPO, "supabase/sync_projects.sql"), out);
console.log(`wrote ${out.length} bytes`);
console.log(`projects: ${ALL.length}`);
