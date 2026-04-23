-- Per-post accent colour for the __highlighted__ fragments in a title.
-- Nullable — NULL means "use the default violet accent".
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS title_accent TEXT;
