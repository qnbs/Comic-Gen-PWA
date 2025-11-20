import { openDB, IDBPDatabase, DBSchema } from 'idb';
import type {
  ComicProject,
  ComicProjectMeta,
  Preset,
  LibraryBook,
  Chapter,
  WorldDB,
  ComicBookPage,
} from '../types';
import { createThumbnail } from './utils';

const DB_NAME = 'ComicGenDB';
const DB_VERSION = 8;
const PROJECTS_META_STORE_NAME = 'projects_meta';
const PROJECT_DATA_STORE_NAME = 'project_data';
const PROJECT_PAGES_STORE_NAME = 'project_pages';
const MEDIA_BLOBS_STORE_NAME = 'media_blobs';
const PRESETS_STORE_NAME = 'presets';
const GUTENBERG_LIBRARY_STORE_NAME = 'gutenberg_library';

// Define the database schema for type safety
interface ComicGenDBSchema extends DBSchema {
  [PROJECTS_META_STORE_NAME]: {
    key: string;
    value: ComicProjectMeta;
    indexes: { createdAt: Date; title: string };
  };
  [PROJECT_DATA_STORE_NAME]: {
    key: string;
    value: {
      id: string;
      originalFullText: string;
      language: 'en' | 'de';
      chapters: Chapter[];
      worldDB: WorldDB;
    };
  };
  [PROJECT_PAGES_STORE_NAME]: {
    key: string;
    value: { id: string; pages: ComicBookPage[] };
  };
  [MEDIA_BLOBS_STORE_NAME]: {
    key: string;
    value: { id: string; blob: Blob };
  };
  [PRESETS_STORE_NAME]: {
    key: number;
    value: Preset;
  };
  [GUTENBERG_LIBRARY_STORE_NAME]: {
    key: string;
    value: LibraryBook;
  };
}

let dbPromise: Promise<IDBPDatabase<ComicGenDBSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<ComicGenDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<ComicGenDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 8) {
          if (db.objectStoreNames.contains('projects')) {
            db.deleteObjectStore('projects');
          }
          if (!db.objectStoreNames.contains(PROJECTS_META_STORE_NAME)) {
            const store = db.createObjectStore(PROJECTS_META_STORE_NAME, {
              keyPath: 'id',
            });
            store.createIndex('createdAt', 'createdAt');
            store.createIndex('title', 'title');
          }
          if (!db.objectStoreNames.contains(PROJECT_DATA_STORE_NAME)) {
            db.createObjectStore(PROJECT_DATA_STORE_NAME, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(PROJECT_PAGES_STORE_NAME)) {
            db.createObjectStore(PROJECT_PAGES_STORE_NAME, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(MEDIA_BLOBS_STORE_NAME)) {
            db.createObjectStore(MEDIA_BLOBS_STORE_NAME, { keyPath: 'id' });
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
        if (oldVersion < 7) {
          if (!db.objectStoreNames.contains(GUTENBERG_LIBRARY_STORE_NAME)) {
            db.createObjectStore(GUTENBERG_LIBRARY_STORE_NAME, {
              keyPath: 'id',
            });
          }
        }
      },
    });
  }
  return dbPromise;
}

// --- Media Blob Functions ---
export async function saveMediaBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDb();
  await db.put(MEDIA_BLOBS_STORE_NAME, { id, blob });
}

export async function getMediaBlob(id: string): Promise<Blob | undefined> {
  const db = await getDb();
  const result = await db.get(MEDIA_BLOBS_STORE_NAME, id);
  return result?.blob;
}

export async function deleteMediaBlob(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(MEDIA_BLOBS_STORE_NAME, id);
}

// --- Project Functions ---
export async function saveProject(project: ComicProject): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(
    [
      PROJECTS_META_STORE_NAME,
      PROJECT_DATA_STORE_NAME,
      PROJECT_PAGES_STORE_NAME,
      MEDIA_BLOBS_STORE_NAME,
    ],
    'readwrite',
  );

  const metaStore = tx.objectStore(PROJECTS_META_STORE_NAME);
  const mediaStore = tx.objectStore(MEDIA_BLOBS_STORE_NAME);

  const existingMeta = await metaStore.get(project.id);
  let newThumbnailId: string | undefined = existingMeta?.thumbnailId;

  const firstPanelImageId = project.pages?.[0]?.panels?.[0]?.imageId;

  if (firstPanelImageId) {
    const thumbnailId = `thumb-${project.id}`;
    try {
      const imageBlob = await getMediaBlob(firstPanelImageId);
      if (imageBlob) {
        const thumbBlob = await createThumbnail(imageBlob);
        await mediaStore.put({ id: thumbnailId, blob: thumbBlob });
        newThumbnailId = thumbnailId;
      }
    } catch (e) {
      console.error('Thumbnail generation failed:', e);
    }
  } else {
    // If there are no pages, ensure there's no thumbnail
    if (existingMeta?.thumbnailId) {
      await mediaStore.delete(existingMeta.thumbnailId);
    }
    newThumbnailId = undefined;
  }

  const meta: ComicProjectMeta = {
    id: project.id,
    title: project.title,
    createdAt: project.createdAt,
    thumbnailId: newThumbnailId,
  };

  const data = {
    id: project.id,
    originalFullText: project.originalFullText,
    language: project.language,
    chapters: project.chapters,
    worldDB: project.worldDB,
  };

  const pages = {
    id: project.id,
    pages: project.pages,
  };

  await Promise.all([
    metaStore.put(meta),
    tx.objectStore(PROJECT_DATA_STORE_NAME).put(data),
    tx.objectStore(PROJECT_PAGES_STORE_NAME).put(pages),
    tx.done,
  ]);
}

export async function getProjects(): Promise<ComicProjectMeta[]> {
  const db = await getDb();
  return db
    .getAllFromIndex(PROJECTS_META_STORE_NAME, 'createdAt')
    .then((projects) => projects.reverse());
}

export async function getProject(id: string): Promise<ComicProject | undefined> {
  const db = await getDb();
  const tx = db.transaction([
    PROJECTS_META_STORE_NAME,
    PROJECT_DATA_STORE_NAME,
    PROJECT_PAGES_STORE_NAME,
  ]);
  const meta = await tx.objectStore(PROJECTS_META_STORE_NAME).get(id);
  if (!meta) return undefined;
  
  const data = await tx.objectStore(PROJECT_DATA_STORE_NAME).get(id);
  const pagesData = await tx.objectStore(PROJECT_PAGES_STORE_NAME).get(id);

  return {
    ...meta,
    language: data?.language || 'en',
    originalFullText: data?.originalFullText || '',
    chapters: data?.chapters || [],
    worldDB: data?.worldDB || { characters: [], locations: [], props: [] },
    pages: pagesData?.pages || [],
  };
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(
    [
      PROJECTS_META_STORE_NAME,
      PROJECT_DATA_STORE_NAME,
      PROJECT_PAGES_STORE_NAME,
      MEDIA_BLOBS_STORE_NAME,
    ],
    'readwrite',
  );

  const [metaStore, dataStore, pagesStore, mediaStore] = [
    tx.objectStore(PROJECTS_META_STORE_NAME),
    tx.objectStore(PROJECT_DATA_STORE_NAME),
    tx.objectStore(PROJECT_PAGES_STORE_NAME),
    tx.objectStore(MEDIA_BLOBS_STORE_NAME),
  ];

  // Fetch all project parts within the same transaction to ensure atomicity
  const [projectMeta, projectData, projectPages] = await Promise.all([
    metaStore.get(id),
    dataStore.get(id),
    pagesStore.get(id),
  ]);

  const mediaIdsToDelete: string[] = [];

  // Collect all media IDs
  if (projectMeta?.thumbnailId) mediaIdsToDelete.push(projectMeta.thumbnailId);

  if (projectData) {
    projectData.worldDB.characters.forEach((c) => {
      if (c.referenceImageId) mediaIdsToDelete.push(c.referenceImageId);
      c.poses?.forEach((p) => p.referenceImageId && mediaIdsToDelete.push(p.referenceImageId));
    });
    projectData.worldDB.locations.forEach((l) => l.referenceImageId && mediaIdsToDelete.push(l.referenceImageId));
    projectData.worldDB.props.forEach((p) => p.referenceImageId && mediaIdsToDelete.push(p.referenceImageId));
  }
  if (projectPages) {
    projectPages.pages.forEach((page) => {
      page.panels.forEach((panel) => {
        if (panel.imageId) mediaIdsToDelete.push(panel.imageId);
        if (panel.videoId) mediaIdsToDelete.push(panel.videoId);
        if (panel.audioId) mediaIdsToDelete.push(panel.audioId);
      });
    });
  }

  const uniqueMediaIds = [...new Set(mediaIdsToDelete)];

  // Schedule all deletions
  const deletePromises = [
    metaStore.delete(id),
    dataStore.delete(id),
    pagesStore.delete(id),
    ...uniqueMediaIds.map(mediaId => mediaStore.delete(mediaId)),
  ];

  await Promise.all(deletePromises);
  await tx.done;
}


export async function deleteMultipleProjects(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const db = await getDb();
  const tx = db.transaction(
    [
      PROJECTS_META_STORE_NAME,
      PROJECT_DATA_STORE_NAME,
      PROJECT_PAGES_STORE_NAME,
      MEDIA_BLOBS_STORE_NAME,
    ],
    'readwrite'
  );

  const [metaStore, dataStore, pagesStore, mediaStore] = [
    tx.objectStore(PROJECTS_META_STORE_NAME),
    tx.objectStore(PROJECT_DATA_STORE_NAME),
    tx.objectStore(PROJECT_PAGES_STORE_NAME),
    tx.objectStore(MEDIA_BLOBS_STORE_NAME),
  ];

  const allMediaIdsToDelete = new Set<string>();

  // Gather all data and associated media IDs within the single transaction
  await Promise.all(ids.map(async (id) => {
    const [projectMeta, projectData, projectPages] = await Promise.all([
      metaStore.get(id),
      dataStore.get(id),
      pagesStore.get(id),
    ]);

    if (projectMeta?.thumbnailId) allMediaIdsToDelete.add(projectMeta.thumbnailId);

    if (projectData) {
        projectData.worldDB.characters.forEach(c => {
            if (c.referenceImageId) allMediaIdsToDelete.add(c.referenceImageId);
            c.poses?.forEach(p => p.referenceImageId && allMediaIdsToDelete.add(p.referenceImageId));
        });
        projectData.worldDB.locations.forEach(l => l.referenceImageId && allMediaIdsToDelete.add(l.referenceImageId));
        projectData.worldDB.props.forEach(p => p.referenceImageId && allMediaIdsToDelete.add(p.referenceImageId));
    }
    if (projectPages) {
        projectPages.pages.forEach(page => {
            page.panels.forEach(panel => {
                if (panel.imageId) allMediaIdsToDelete.add(panel.imageId);
                if (panel.videoId) allMediaIdsToDelete.add(panel.videoId);
                if (panel.audioId) allMediaIdsToDelete.add(panel.audioId);
            });
        });
    }
  }));
  
  // Issue all delete operations.
  const deletePromises = [];

  for (const id of ids) {
    deletePromises.push(metaStore.delete(id));
    deletePromises.push(dataStore.delete(id));
    deletePromises.push(pagesStore.delete(id));
  }

  for (const mediaId of allMediaIdsToDelete) {
    deletePromises.push(mediaStore.delete(mediaId));
  }
  
  await Promise.all(deletePromises);
  await tx.done; // Commit the transaction
}


export async function clearAllProjects(): Promise<void> {
    const db = await getDb();
    const projectMetas = await getProjects();
    await deleteMultipleProjects(projectMetas.map(p => p.id));
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

// --- Gutenberg Library Functions ---

export async function saveLibraryBook(book: LibraryBook): Promise<void> {
    const db = await getDb();
    await db.put(GUTENBERG_LIBRARY_STORE_NAME, book);
}

export async function getLibraryBooks(): Promise<LibraryBook[]> {
    const db = await getDb();
    return db.getAll(GUTENBERG_LIBRARY_STORE_NAME);
}

export async function deleteLibraryBook(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(GUTENBERG_LIBRARY_STORE_NAME, id);
}

export async function isBookSaved(id: string): Promise<boolean> {
    const db = await getDb();
    const book = await db.get(GUTENBERG_LIBRARY_STORE_NAME, id);
    return !!book;
}