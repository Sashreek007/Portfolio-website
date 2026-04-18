-- Tags on posts. Lets the blog index show a tag filter and lets posts
-- carry topic metadata ("systems", "postgres", "papers", …).
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS posts_tags_gin_idx ON posts USING gin (tags);
