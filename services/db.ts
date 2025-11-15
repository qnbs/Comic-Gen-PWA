import { openDB, IDBPDatabase } from 'idb';
import type { ComicPageData, StoredComic } from '../types';

const DB_NAME = 'ComicGenDB';
const DB_VERSION = 1;
const COMICS_STORE_NAME = 'comics';


let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(COMICS_STORE_NAME)) {
                    const store = db.createObjectStore(COMICS_STORE_NAME, { keyPath: 'id' });
                    store.createIndex('createdAt', 'createdAt');
                }
            },
        });
    }
    return dbPromise;
}

export async function saveComic(page: ComicPageData, title: string): Promise<string> {
    const db = await getDb();
    const id = `comic-${Date.now()}`;
    const comic: StoredComic = {
        id,
        title,
        createdAt: new Date(),
        page,
    };
    await db.put(COMICS_STORE_NAME, comic);
    return id;
}

export async function getComics(): Promise<StoredComic[]> {
    const db = await getDb();
    // Sort by most recent
    return db.getAllFromIndex(COMICS_STORE_NAME, 'createdAt').then(comics => comics.reverse());
}

export async function deleteComic(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(COMICS_STORE_NAME, id);
}

export async function clearAllComics(): Promise<void> {
    const db = await getDb();
    await db.clear(COMICS_STORE_NAME);
}