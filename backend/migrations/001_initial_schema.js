// Initial database schema migration
export const up = async (db) => {
  // Users table
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(200) NOT NULL,
      avatar_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Moodentries table
  await db.query(`
    CREATE TABLE IF NOT EXISTS moodentries (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      mood VARCHAR(20),
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Tasks table
  await db.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE,
      day DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Journals table
  await db.query(`
    CREATE TABLE IF NOT EXISTS journals (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      day DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

export const down = async (db) => {
  await db.query('DROP TABLE IF EXISTS journals CASCADE');
  await db.query('DROP TABLE IF EXISTS tasks CASCADE');
  await db.query('DROP TABLE IF EXISTS moodentries CASCADE');
  await db.query('DROP TABLE IF EXISTS users CASCADE');
};
