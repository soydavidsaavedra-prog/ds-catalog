import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Minimal file-backed JSON store.
 *
 * This is the whole "database" for the current phase: it's fast to ship,
 * needs no external account, and every repository is written against a
 * narrow async CRUD interface — so swapping this module for a real
 * Postgres/Supabase client later is a one-file change, not a rewrite.
 * See docs/ARCHITECTURE.md for the migration plan.
 *
 * Server-only: repositories that use this must not be imported from
 * client components.
 */

const DATA_DIR = path.join(process.cwd(), ".data");

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export function createJsonStore<T>(name: string, seed: T) {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  let cache: T | null = null;
  let initPromise: Promise<T> | null = null;

  async function init(): Promise<T> {
    if (cache !== null) return cache;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      await ensureDataDir();
      try {
        const raw = await readFile(filePath, "utf-8");
        cache = JSON.parse(raw) as T;
      } catch {
        cache = seed;
        await writeFile(filePath, JSON.stringify(seed, null, 2), "utf-8");
      }
      return cache;
    })();

    return initPromise;
  }

  return {
    async read(): Promise<T> {
      return init();
    },
    async write(data: T): Promise<void> {
      cache = data;
      await ensureDataDir();
      await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    },
  };
}
