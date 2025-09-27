// Add day column to moodentries for better date filtering
export const up = async (db) => {
  // Add day column to moodentries
  await db.query(`
    ALTER TABLE moodentries 
    ADD COLUMN IF NOT EXISTS day DATE
  `);

  // Migrate existing data
  await db.query(`
    UPDATE moodentries 
    SET day = DATE(created_at) 
    WHERE day IS NULL
  `);

  // Make day column NOT NULL after migration
  await db.query(`
    ALTER TABLE moodentries 
    ALTER COLUMN day SET NOT NULL
  `);

  // Add index for faster day-based queries
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_moodentries_day_user 
    ON moodentries(day, user_id)
  `);
};

export const down = async (db) => {
  await db.query('DROP INDEX IF EXISTS idx_moodentries_day_user');
  await db.query('ALTER TABLE moodentries DROP COLUMN IF EXISTS day');
};
