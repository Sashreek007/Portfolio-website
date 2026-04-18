-- Page view log used by /admin/analytics. Inserted from the /api/track
-- route which runs with the service role, so no public INSERT policy.
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

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_views_auth_read"
  ON page_views FOR SELECT
  TO authenticated USING (true);
