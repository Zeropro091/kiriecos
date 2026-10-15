/**
 * KIRI PROJECT — IndexedDB binary vault.
 *
 * Replaces Supabase Storage for the bytes themselves. Receipt proofs and media
 * uploads are compressed to WebP in the browser (see utils/imageCompressor.ts),
 * then parked here as Blobs. localStorage cannot hold these: it is string-only
 * and capped around 5 MB, so a handful of bank receipts would blow the quota.
 *
 * Every function degrades instead of throwing. If IndexedDB is unavailable
 * (private browsing on some engines, storage disabled by policy) `isAvailable`
 * turns false and callers fall back to in-memory blobs for the session —
 * uploads still work, they just do not survive a refresh.
 */

const DB_NAME = 'kiri_project_vault';
const DB_VERSION = 1;
const BLOB_STORE = 'blobs';

let dbPromise: Promise<IDBDatabase> | null = null;
let available: boolean | null = null;

/** Session-only fallback when IndexedDB cannot be opened. */
const memoryVault = new Map<string, Blob>();

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        // Keyed by storage path (e.g. "receipts/1712345_ab12cd.webp").
        db.createObjectStore(BLOB_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
    request.onblocked = () => reject(new Error('IndexedDB open blocked by another tab'));
  });

  return dbPromise;
}

/** Resolve availability once, then cache. Never rejects. */
export async function isIdbAvailable(): Promise<boolean> {
  if (available !== null) return available;
  try {
    await openDatabase();
    available = true;
  } catch (err) {
    console.warn('[KIRI] IndexedDB unavailable, using session-only blob memory:', err);
    available = false;
  }
  return available;
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(BLOB_STORE, mode);
        const request = work(tx.objectStore(BLOB_STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
        tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
      })
  );
}

export async function putBlob(path: string, blob: Blob): Promise<void> {
  if (await isIdbAvailable()) {
    await runTransaction('readwrite', (store) => store.put(blob, path));
    return;
  }
  memoryVault.set(path, blob);
}

export async function getBlob(path: string): Promise<Blob | undefined> {
  if (await isIdbAvailable()) {
    return runTransaction<Blob | undefined>('readonly', (store) => store.get(path));
  }
  return memoryVault.get(path);
}

export async function deleteBlob(path: string): Promise<void> {
  if (await isIdbAvailable()) {
    await runTransaction('readwrite', (store) => store.delete(path));
    return;
  }
  memoryVault.delete(path);
}

export async function listBlobPaths(): Promise<string[]> {
  if (await isIdbAvailable()) {
    const keys = await runTransaction<IDBValidKey[]>('readonly', (store) => store.getAllKeys());
    return keys.map((k) => String(k));
  }
  return [...memoryVault.keys()];
}

/** Wipe the whole vault — used by the "reset local data" action. */
export async function clearBlobs(): Promise<void> {
  memoryVault.clear();
  if (await isIdbAvailable()) {
    await runTransaction('readwrite', (store) => store.clear());
  }
}
