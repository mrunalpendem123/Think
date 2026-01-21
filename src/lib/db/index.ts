import path from 'path';
import * as schema from './schema';

// Try to import better-sqlite3, but handle gracefully if it's not available
let Database: any;
let drizzle: any;
let db: any = null;

try {
  Database = require('better-sqlite3');
  drizzle = require('drizzle-orm/better-sqlite3').drizzle;
  
  const DATA_DIR = process.env.DATA_DIR || process.cwd();
  let dbPath = path.join(DATA_DIR, './data/db.sqlite');

  if (process.env.VERCEL) {
    dbPath = path.join('/tmp', 'db.sqlite');
  }

  // Ensure data directory exists
  const fs = require('fs');
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, {
    schema: schema,
  });
} catch (error) {
  console.warn('better-sqlite3 not available, using mock database:', error);
  // Mock database that returns empty results
  db = {
    query: {
      chats: { findMany: () => [], findFirst: () => null },
      messages: { findMany: () => [], findFirst: () => null },
    },
    insert: () => ({ values: () => ({ execute: () => Promise.resolve() }) }),
    update: () => ({ set: () => ({ where: () => ({ execute: () => Promise.resolve() }) }) }),
    delete: () => ({ where: () => ({ execute: () => Promise.resolve() }) }),
  };
}

export default db;
