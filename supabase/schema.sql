-- ─── Projects ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  github_url  TEXT,
  demo_url    TEXT,
  image_url   TEXT,
  video_url   TEXT,
  stack       TEXT[] DEFAULT '{}',
  status      TEXT DEFAULT 'shipped' CHECK (status IN ('active','shipped','building')),
  year        INTEGER,
  is_best     BOOLEAN DEFAULT false,
  is_current  BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Posts ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  content         JSONB,
  excerpt         TEXT,
  cover_image_url TEXT,
  is_published    BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ,
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
  show_on_writing BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS posts_project_id_idx ON posts (project_id);
CREATE UNIQUE INDEX IF NOT EXISTS posts_project_id_unique_idx
  ON posts (project_id) WHERE project_id IS NOT NULL;

-- ─── Page views (analytics) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id  TEXT NOT NULL,
  path        TEXT NOT NULL,
  user_agent  TEXT,
  referrer    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_visitor_id_idx ON page_views (visitor_id);

-- ─── Auto-update updated_at ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts    ENABLE ROW LEVEL SECURITY;

-- Projects: anyone can read, only authenticated can write
CREATE POLICY "projects_public_read"
  ON projects FOR SELECT USING (true);

CREATE POLICY "projects_auth_insert"
  ON projects FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "projects_auth_update"
  ON projects FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "projects_auth_delete"
  ON projects FOR DELETE
  TO authenticated USING (true);

-- Posts: only published posts are public; authenticated can read all
CREATE POLICY "posts_public_read"
  ON posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "posts_auth_read_all"
  ON posts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "posts_auth_insert"
  ON posts FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "posts_auth_update"
  ON posts FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "posts_auth_delete"
  ON posts FOR DELETE
  TO authenticated USING (true);

-- Page views: authenticated admin can read; inserts go through the
-- /api/track route using the service role key, which bypasses RLS.
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_views_auth_read"
  ON page_views FOR SELECT
  TO authenticated USING (true);

-- ─── Storage buckets ──────────────────────────────────────────────────
-- Run these in the Supabase dashboard Storage section:
-- 1. Create bucket: project-media (public)
-- 2. Create bucket: blog-media (public)
--
-- Then add policies:
-- project-media: public SELECT, authenticated INSERT/UPDATE/DELETE
-- blog-media:    public SELECT, authenticated INSERT/UPDATE/DELETE
