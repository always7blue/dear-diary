import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration table to track applied migrations
const createMigrationsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Get list of migration files
const getMigrationFiles = () => {
  const migrationsDir = path.join(__dirname);
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js') && file !== 'migrate.js')
    .sort();
};

// Get applied migrations from database
const getAppliedMigrations = async () => {
  const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
  return result.rows.map(row => row.filename);
};

// Run a single migration
const runMigration = async (filename) => {
  const filePath = path.join(__dirname, filename);
  const module = await import(filePath);
  
  console.log(`Running migration: ${filename}`);
  
  try {
    await module.up(pool);
    await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
    console.log(`✅ Migration ${filename} completed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${filename} failed:`, error.message);
    throw error;
  }
};

// Rollback a single migration
const rollbackMigration = async (filename) => {
  const filePath = path.join(__dirname, filename);
  const module = await import(filePath);
  
  console.log(`Rolling back migration: ${filename}`);
  
  try {
    await module.down(pool);
    await pool.query('DELETE FROM migrations WHERE filename = $1', [filename]);
    console.log(`✅ Rollback ${filename} completed successfully`);
  } catch (error) {
    console.error(`❌ Rollback ${filename} failed:`, error.message);
    throw error;
  }
};

// Main migration function
export const migrate = async () => {
  try {
    await createMigrationsTable();
    
    const migrationFiles = getMigrationFiles();
    const appliedMigrations = await getAppliedMigrations();
    
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(file => console.log(`  - ${file}`));
    
    for (const filename of pendingMigrations) {
      await runMigration(filename);
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message);
    process.exit(1);
  }
};

// Rollback function
export const rollback = async (steps = 1) => {
  try {
    await createMigrationsTable();
    
    const appliedMigrations = await getAppliedMigrations();
    const migrationsToRollback = appliedMigrations.slice(-steps);
    
    if (migrationsToRollback.length === 0) {
      console.log('✅ No migrations to rollback');
      return;
    }
    
    console.log(`Rolling back ${migrationsToRollback.length} migrations:`);
    migrationsToRollback.forEach(file => console.log(`  - ${file}`));
    
    for (const filename of migrationsToRollback.reverse()) {
      await rollbackMigration(filename);
    }
    
    console.log('🎉 Rollback completed successfully!');
    
  } catch (error) {
    console.error('💥 Rollback failed:', error.message);
    process.exit(1);
  }
};

// Status function
export const status = async () => {
  try {
    await createMigrationsTable();
    
    const migrationFiles = getMigrationFiles();
    const appliedMigrations = await getAppliedMigrations();
    
    console.log('\n📊 Migration Status:');
    console.log('==================');
    
    migrationFiles.forEach(file => {
      const status = appliedMigrations.includes(file) ? '✅ Applied' : '⏳ Pending';
      console.log(`${status} ${file}`);
    });
    
    console.log(`\nTotal: ${migrationFiles.length} migrations`);
    console.log(`Applied: ${appliedMigrations.length}`);
    console.log(`Pending: ${migrationFiles.length - appliedMigrations.length}`);
    
  } catch (error) {
    console.error('💥 Status check failed:', error.message);
    process.exit(1);
  }
};

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'migrate':
      await migrate();
      break;
    case 'rollback':
      await rollback(parseInt(arg) || 1);
      break;
    case 'status':
      await status();
      break;
    default:
      console.log(`
Usage: node migrate.js <command> [options]

Commands:
  migrate          Run pending migrations
  rollback [n]     Rollback last n migrations (default: 1)
  status           Show migration status

Examples:
  node migrate.js migrate
  node migrate.js rollback 2
  node migrate.js status
      `);
  }
  
  await pool.end();
}
