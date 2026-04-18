-- Single-row blog profile table used by the /blog about block. Admin
-- edits the heading + body through /admin/blog/profile; the public
-- blog reads it server-side on render.
CREATE TABLE IF NOT EXISTS blog_profile (
  id          INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  heading     TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO blog_profile (id, heading, body) VALUES (
  1,
  'i *love research* and _building software_.',
  'short notes on what i''m learning, reading, and breaking. no cadence, no funnel.'
) ON CONFLICT (id) DO NOTHING;

ALTER TABLE blog_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_profile_public_read"
  ON blog_profile FOR SELECT USING (true);

CREATE POLICY "blog_profile_auth_insert"
  ON blog_profile FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "blog_profile_auth_update"
  ON blog_profile FOR UPDATE TO authenticated USING (true);
