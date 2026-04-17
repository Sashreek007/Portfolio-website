DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM projects
    WHERE name = 'Streaks'
      AND github_url = 'https://github.com/Sashreek007/Streaks'
  ) THEN
    DELETE FROM projects
    WHERE name = 'Streaks'
      AND github_url = 'https://github.com/Sashreek007/Streaks';

    UPDATE projects
    SET sort_order = sort_order - 1
    WHERE sort_order > 2;
  END IF;
END $$;
