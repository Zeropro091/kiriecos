/**
 * KIRI PROJECT — local file store.
 *
 * Replaces Supabase Storage (`receipts`, `avatars`, `portfolios` buckets) and
 * the signed-URL dance that went with them. Uploads are compressed to WebP in
 * the browser, written to the IndexedDB vault as a Blob, and addressed by an
 * opaque path — the direct analogue of a bucket object key.
 *
 * Reading back is where local play diverges from Supabase. There is no signing
 * server, so a stored path cannot be handed to an <img src> as-is. We mint a
 * short-lived object URL on demand (see `resolve`). Two consequences worth
 * knowing:
 *
 *   - Object URLs are per-session. A path stored last week resolves fine today
 *     because we re-mint from the vault, but the URL string is not portable —
 *     never persist a resolved URL, persist the path.
 *   - We ref-count the minted URLs. Without that they pin their Blobs in memory
 *     for the life of the document, which is a real leak on a gallery page.
 */

import { compressImage } from '../utils/imageCompressor';
import { putBlob, getBlob, deleteBlob, clearBlobs, isIdbAvailable } from './idb';

export type FileFolder = 'avatars' | 'portfolios' | 'covers' | 'receipts';

const OBJECT_URL_PREFIX = 'blob:';

/** Mints kept alive per document, so we can revoke without breaking live <img>. */
const mintedUrls = new Map<string, number>();

function makePath(folder: FileFolder, extension: string): string {
  const stamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 10);
  return `${folder}/${stamp}_${rand}.${extension}`;
}

/** A path is ours to resolve when it is not already a usable URL. */
export function isStoredPath(value: string): boolean {
  if (!value) return false;
  return !/^(https?:|blob:|data:)/i.test(value);
}

export const localFiles = {
  /**
   * Compress and persist a user upload, returning the vault path.
   * Falls back to a data URL when IndexedDB is unavailable, so a screenshot
   * still renders after upload even in a privacy-restricted browser.
   */
  async upload(file: File, folder: FileFolder): Promise<string> {
    const isAvatar = folder === 'avatars';
    const blob = await compressImage(file, {
      maxWidth: isAvatar ? 600 : 1600,
      maxHeight: isAvatar ? 600 : 1600,
      quality: folder === 'receipts' ? 0.85 : isAvatar ? 0.85 : 0.8,
      outputFormat: 'image/webp',
    });

    if (!(await isIdbAvailable())) {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Could not read the selected file.'));
        reader.readAsDataURL(blob);
      });
    }

    const path = makePath(folder, 'webp');
    await putBlob(path, blob);
    return path;
  },

  /**
   * Turn a stored path into something an <img src> accepts.
   *
   * Pass-through for http(s), blob: and data: values — that covers records
   * written by the previous build, whose receipt_image_url and avatar fields
   * still hold absolute URLs. Upgrading therefore does not break media that is
   * already on screen.
   */
  async resolve(pathOrUrl: string): Promise<string> {
    if (!isStoredPath(pathOrUrl)) return pathOrUrl;

    const blob = await getBlob(pathOrUrl);
    if (!blob) {
      console.warn('[KIRI] Stored file missing from vault:', pathOrUrl);
      return pathOrUrl;
    }

    const url = URL.createObjectURL(blob);
    mintedUrls.set(url, (mintedUrls.get(url) ?? 0) + 1);
    return url;
  },

  /** Resolve many paths at once — one round trip for a gallery. */
  async resolveAll(paths: string[]): Promise<string[]> {
    return Promise.all(paths.map((p) => this.resolve(p)));
  },

  /** Release a minted URL. Safe to call on paths we did not mint. */
  release(url: string): void {
    if (!url.startsWith(OBJECT_URL_PREFIX)) return;
    const refs = mintedUrls.get(url);
    if (refs === undefined) return;
    if (refs > 1) {
      mintedUrls.set(url, refs - 1);
      return;
    }
    mintedUrls.delete(url);
    URL.revokeObjectURL(url);
  },

  releaseAll(): void {
    mintedUrls.forEach((_refs, url) => URL.revokeObjectURL(url));
    mintedUrls.clear();
  },

  async remove(path: string): Promise<void> {
    if (!isStoredPath(path)) return;
    await deleteBlob(path);
    console.info('[KIRI] Removed stored file:', path);
  },

  clearAll: clearBlobs,
};

/**
 * Kept as a named export for callers that migrated from the Supabase version,
 * where `signReceipt` refreshed an expiring signed URL. Locally there is no
 * expiry — this is a straight alias so the call sites read the same.
 */
export const signReceipt = (path: string): Promise<string> => localFiles.resolve(path);
