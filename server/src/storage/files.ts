import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config.js';

const here = dirname(fileURLToPath(import.meta.url));
export const UPLOAD_ROOT = join(here, '..', '..', env.UPLOAD_DIR);

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
};

/** Persist a `data:` URL to disk and return its public path (e.g. /uploads/receipts/x.png). */
export function saveDataUrl(dataUrl: string, folder: 'receipts' | 'avatars' | 'portfolios'): string {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) throw new Error('Format gambar tidak valid.');

  const mime = match[1].toLowerCase();
  const ext = EXT_BY_MIME[mime];
  if (!ext) throw new Error('Tipe gambar tidak didukung (PNG/JPG/WEBP).');

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.byteLength > env.MAX_UPLOAD_BYTES) {
    throw new Error('Ukuran berkas melebihi batas.');
  }

  const dir = join(UPLOAD_ROOT, folder);
  mkdirSync(dir, { recursive: true });

  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  writeFileSync(join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}
