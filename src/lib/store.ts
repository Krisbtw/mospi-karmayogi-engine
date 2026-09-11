import fs from 'fs/promises';
import path from 'path';
import type { DB } from './types';
import { buildSeed } from './seed';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
let cache: DB | null = null;
let persist = true;

export async function getDB(): Promise<DB> {
  if (cache) return cache;
  try {
    cache = JSON.parse(await fs.readFile(DB_FILE, 'utf8')) as DB;
  } catch {
    cache = await buildSeed();
    await persistDB();
  }
  return cache;
}

async function persistDB() {
  if (!cache || !persist) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(cache));
  } catch {
    persist = false; // read-only filesystem (serverless) — continue in-memory so the demo never breaks
  }
}

export async function updateDB(fn: (db: DB) => void): Promise<DB> {
  const db = await getDB();
  fn(db);
  await persistDB();
  return db;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
