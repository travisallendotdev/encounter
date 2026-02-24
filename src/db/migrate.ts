import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function migrate(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsDir = join(__dirname, 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const applied = db.prepare('SELECT 1 FROM migrations WHERE filename = ?').get(file);
    if (!applied) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      db.exec(sql);
      db.prepare('INSERT INTO migrations (filename) VALUES (?)').run(file);
      console.log(`Applied migration: ${file}`);
    }
  }
}
