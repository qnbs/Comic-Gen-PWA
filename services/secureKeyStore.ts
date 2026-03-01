const DB_NAME = 'ComicGenSecureDB';
const DB_VERSION = 1;
const STORE_NAME = 'secrets';
const AES_KEY_STORE_KEY = 'gemini_aes_key';
const API_KEY_CIPHER_STORE_KEY = 'gemini_api_key_cipher';

interface CipherPayload {
  iv: number[];
  data: number[];
}

function openSecureDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openSecureDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

async function idbPut<T>(key: string, value: T): Promise<void> {
  const db = await openSecureDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDelete(key: string): Promise<void> {
  const db = await openSecureDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getOrCreateAesKey(): Promise<CryptoKey> {
  const existing = await idbGet<CryptoKey>(AES_KEY_STORE_KEY);
  if (existing) return existing;

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  );
  await idbPut(AES_KEY_STORE_KEY, key);
  return key;
}

export async function saveGeminiApiKeyEncrypted(apiKey: string): Promise<void> {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new Error('API key is empty.');
  }

  const key = await getOrCreateAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(trimmed);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext,
  );

  const payload: CipherPayload = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  };

  await idbPut(API_KEY_CIPHER_STORE_KEY, payload);
}

export async function loadGeminiApiKeyDecrypted(): Promise<string | null> {
  const payload = await idbGet<CipherPayload>(API_KEY_CIPHER_STORE_KEY);
  if (!payload) return null;

  const key = await getOrCreateAesKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(payload.iv) },
    key,
    new Uint8Array(payload.data),
  );

  return new TextDecoder().decode(decrypted);
}

export async function hasGeminiApiKeyEncrypted(): Promise<boolean> {
  const payload = await idbGet<CipherPayload>(API_KEY_CIPHER_STORE_KEY);
  return !!payload;
}

export async function clearGeminiApiKeyEncrypted(): Promise<void> {
  await idbDelete(API_KEY_CIPHER_STORE_KEY);
}
