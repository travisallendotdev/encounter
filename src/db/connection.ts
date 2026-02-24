import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';

mkdirSync('data', { recursive: true });

const db = new Database('data/encounter.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
