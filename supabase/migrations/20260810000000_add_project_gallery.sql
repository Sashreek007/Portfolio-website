-- Projects carry one hero medium (image_url / video_url) plus an ordered
-- gallery of supporting figures. Array order is the display order.
-- Each entry: { "url": text, "alt": text, "caption": text }
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS gallery JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Guard against a non-array ever landing in the column.
ALTER TABLE projects
  DROP CONSTRAINT IF EXISTS projects_gallery_is_array;
ALTER TABLE projects
  ADD CONSTRAINT projects_gallery_is_array
  CHECK (jsonb_typeof(gallery) = 'array');

-- Short, factual result lines. The description stays card-length; anything
-- longer than a sentence or two belongs here so the grid layout survives.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS highlights TEXT[] NOT NULL DEFAULT '{}';
