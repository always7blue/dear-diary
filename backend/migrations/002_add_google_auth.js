// Add Google OAuth support
export const up = async (db) => {
  // Add Google ID column to users table
  await db.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) UNIQUE,
    ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'local'
  `);

  // Create index for faster Google ID lookups
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_users_google_id 
    ON users(google_id) 
    WHERE google_id IS NOT NULL
  `);
};

export const down = async (db) => {
  await db.query('DROP INDEX IF EXISTS idx_users_google_id');
  await db.query(`
    ALTER TABLE users 
    DROP COLUMN IF EXISTS google_id,
    DROP COLUMN IF EXISTS provider
  `);
};
