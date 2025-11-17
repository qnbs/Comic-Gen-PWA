import { openDB, IDBPDatabase } from 'idb';
import type { ComicProject, Preset } from '../types';

const DB_NAME = 'ComicGenDB';
const DB_VERSION = 6;
const PROJECTS_STORE_NAME = 'projects';
const PRESETS_STORE_NAME = 'presets';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 4) {
           if (!db.objectStoreNames.contains(PRESETS_STORE_NAME)) {
            db.createObjectStore(PRESETS_STORE_NAME, { keyPath: 'id', autoIncrement: true });
          }
        }
        if (oldVersion < 6) {
          if (!db.objectStoreNames.contains(PROJECTS_STORE_NAME)) {
            const store = db.createObjectStore(PROJECTS_STORE_NAME, { keyPath: 'id' });
            store.createIndex('createdAt', 'createdAt');
            store.createIndex('title', 'title');
          }
          // Cleanup old stores if they exist from previous versions
          if (db.objectStoreNames.contains('progress')) {
              db.deleteObjectStore('progress');
          }
           if (db.objectStoreNames.contains('comics')) {
              db.deleteObjectStore('comics');
          }
        }
      },
    });
  }
  return dbPromise;
}

// --- Project Functions ---

export async function saveProject(project: ComicProject): Promise<void> {
    const db = await getDb();
    await db.put(PROJECTS_STORE_NAME, project);
}

export async function getProjects(): Promise<ComicProject[]> {
    const db = await getDb();
    return db.getAllFromIndex(PROJECTS_STORE_NAME, 'createdAt').then(projects => projects.reverse());
}

export async function deleteProject(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(PROJECTS_STORE_NAME, id);
}

export async function deleteMultipleProjects(ids: string[]): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(PROJECTS_STORE_NAME, 'readwrite');
  await Promise.all(ids.map(id => tx.store.delete(id)));
  await tx.done;
}

export async function clearAllProjects(): Promise<void> {
    const db = await getDb();
    await db.clear(PROJECTS_STORE_NAME);
}

// --- Presets Functions ---

export async function getPresets(): Promise<Preset[]> {
  const db = await getDb();
  return db.getAll(PRESETS_STORE_NAME);
}

export async function savePreset(preset: Omit<Preset, 'id'>): Promise<Preset> {
  const db = await getDb();
  const id = await db.put(PRESETS_STORE_NAME, preset);
  return { ...preset, id: id as number };
}

export async function deletePreset(id: number): Promise<void> {
  const db = await getDb();
  await db.delete(PRESETS_STORE_NAME, id);
}