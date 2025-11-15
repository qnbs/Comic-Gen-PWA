import { openDB, IDBPDatabase } from 'idb';
import type { StoredComic, SavedProgress, Preset } from '../types';

const DB_NAME = 'ComicGenDB';
const DB_VERSION = 5; // Incremented version to trigger schema upgrade
const COMICS_STORE_NAME = 'comics';
const PROGRESS_STORE_NAME = 'progress';
const PRESETS_STORE_NAME = 'presets';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, tx) {
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains(COMICS_STORE_NAME)) {
            const store = db.createObjectStore(COMICS_STORE_NAME, {
              keyPath: 'id',
            });
            store.createIndex('createdAt', 'createdAt');
          }
          if (!db.objectStoreNames.contains(PROGRESS_STORE_NAME)) {
            db.createObjectStore(PROGRESS_STORE_NAME, { keyPath: 'id' });
          }
        }
        if (oldVersion < 3) {
          const store = tx.objectStore(COMICS_STORE_NAME);
          if (!store.indexNames.contains('title')) {
            store.createIndex('title', 'title');
          }
        }
        if (oldVersion < 4) {
          if (!db.objectStoreNames.contains(PRESETS_STORE_NAME)) {
            db.createObjectStore(PRESETS_STORE_NAME, {
              keyPath: 'id',
              autoIncrement: true,
            });
          }
        }
        if (oldVersion < 5) {
          const store = tx.objectStore(COMICS_STORE_NAME);
          if (!store.indexNames.contains('language')) {
            store.createIndex('language', 'language');
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function saveComic(comic: StoredComic): Promise<void> {
  const db = await getDb();
  await db.put(COMICS_STORE_NAME, comic);
}

export async function getComics(): Promise<StoredComic[]> {
  const db = await getDb();
  // Sort by most recent
  return db
    .getAllFromIndex(COMICS_STORE_NAME, 'createdAt')
    .then((comics) => comics.reverse());
}

export async function deleteComic(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(COMICS_STORE_NAME, id);
}

export async function deleteMultipleComics(ids: string[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(COMICS_STORE_NAME, 'readwrite');
  await Promise.all(ids.map((id) => tx.store.delete(id)));
  await tx.done;
}

export async function clearAllComics(): Promise<void> {
  const db = await getDb();
  await db.clear(COMICS_STORE_NAME);
}

// --- Session Progress Functions ---

const PROGRESS_KEY = 'current';

export async function saveProgress(progress: SavedProgress): Promise<void> {
  const db = await getDb();
  await db.put(PROGRESS_STORE_NAME, { ...progress, id: PROGRESS_KEY });
}

export async function loadProgress(): Promise<SavedProgress | null> {
  const db = await getDb();
  const progress = await db.get(PROGRESS_STORE_NAME, PROGRESS_KEY);
  return progress || null;
}

export async function clearProgress(): Promise<void> {
  const db = await getDb();
  try {
    await db.delete(PROGRESS_STORE_NAME, PROGRESS_KEY);
  } catch (e) {
    console.error('Could not clear progress from DB', e);
  }
}

// --- Presets Functions ---

export async function getPresets(): Promise<Preset[]> {
  const db = await getDb();
  return db.getAll(PRESETS_STORE_NAME);
}

export async function savePreset(
  preset: Omit<Preset, 'id'>,
): Promise<Preset> {
  const db = await getDb();
  const id = await db.put(PRESETS_STORE_NAME, preset);
  return { ...preset, id: id as number };
}

export async function deletePreset(id: number): Promise<void> {
  const db = await getDb();
  await db.delete(PRESETS_STORE_NAME, id);
}
