import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import * as schema from './schema';

const DATA_DIR = process.env.DATA_DIR || process.cwd();
let dbPath = path.join(DATA_DIR, './data/db.sqlite');

if (process.env.VERCEL) {
  dbPath = path.join('/tmp', 'db.sqlite');
}

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
const db = drizzle(sqlite, {
  schema: schema,
});

export default db;
