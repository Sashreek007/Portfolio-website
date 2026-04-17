-- Link posts to projects + admin toggle for writing-page visibility
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS show_on_writing BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS posts_project_id_idx ON posts (project_id);
CREATE UNIQUE INDEX IF NOT EXISTS posts_project_id_unique_idx
  ON posts (project_id) WHERE project_id IS NOT NULL;
