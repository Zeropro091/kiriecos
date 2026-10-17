import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Readable } from 'node:stream';
import { env } from '../config.js';

const here = dirname(fileURLToPath(import.meta.url));
export const UPLOAD_ROOT = join(here, '..', '..', env.UPLOAD_DIR);

/** True when uploads are stored in Neon Object Storage rather than local disk. */
export const useObjectStorage = Boolean(env.S3_BUCKET && env.S3_ENDPOINT);

// Credentials, endpoint and region come from the AWS_* env vars pulled by `neon env pull`.
// Neon requires path-style addressing.
const s3 = useObjectStorage ? new S3Client({ forcePathStyle: true }) : null;

/** Object keys we ever write: <folder>/<timestamp>_<rand>.<ext>. Anything else is rejected. */
export const OBJECT_KEY_PATTERN = /^(receipts|avatars|portfolios)\/[A-Za-z0-9_-]+\.(png|jpg|webp|pdf)$/;

export interface StoredObject {
  body: Readable;
  contentLength?: number;
}

/** Fetch an uploaded object from the bucket. Returns null when it does not exist. */
export async function getObject(key: string): Promise<StoredObject | null> {
  if (!s3) throw new Error('Object storage is not configured.');
  try {
    const out = await s3.send(new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
    if (!out.Body) return null;
    return { body: out.Body as Readable, contentLength: out.ContentLength };
  } catch (err) {
    const name = (err as { name?: string }).name;
    if (name === 'NoSuchKey' || name === 'NotFound') return null;
    throw err;
  }
}

export class UnsupportedMediaTypeError extends Error {
  readonly status = 415;
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedMediaTypeError';
  }
}

export class PayloadTooLargeError extends Error {
  readonly status = 413;
  constructor(message: string) {
    super(message);
    this.name = 'PayloadTooLargeError';
  }
}

const MAX_DECODED_BYTES = env.MAX_UPLOAD_BYTES;

/** Magic-byte signature checks: PNG, JPEG, PDF, WEBP only. */
function detectMagic(buffer: Buffer): string | null {
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 && // P
    buffer[2] === 0x4e && // N
    buffer[3] === 0x47 && // G
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;
  if (isPng) return 'png';

  const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (isJpeg) return 'jpg';

  const isPdf =
    buffer.length >= 4 &&
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46; // F
  if (isPdf) return 'pdf';

  const isWebp =
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';
  if (isWebp) return 'webp';

  return null;
}

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/** Persist a `data:` URL (bucket or disk) and return its app path (e.g. /uploads/receipts/x.png).
 *  Validates magic bytes (PNG/JPEG/PDF/WEBP only — SVG/HTML/etc. rejected) and enforces
 *  the ~5MB decoded-size cap. Throws UnsupportedMediaTypeError (415) on signature
 *  mismatch and PayloadTooLargeError (413) when too large. */
export async function saveDataUrl(
  dataUrl: string,
  folder: 'receipts' | 'avatars' | 'portfolios'
): Promise<string> {
  const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) throw new UnsupportedMediaTypeError('Format gambar tidak valid.');

  const mime = match[1].toLowerCase();
  const ext = EXT_BY_MIME[mime];
  if (!ext) throw new UnsupportedMediaTypeError('Tipe berkas tidak didukung (PNG/JPG/WEBP/PDF).');

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.byteLength > MAX_DECODED_BYTES) {
    throw new PayloadTooLargeError('Ukuran berkas melebihi batas (maksimal 5MB).');
  }

  const detected = detectMagic(buffer);
  if (!detected || detected !== ext) {
    throw new UnsupportedMediaTypeError(
      'Isi berkas tidak cocok dengan tipe yang diizinkan (PNG/JPG/WEBP/PDF). SVG/HTML tidak diizinkan.'
    );
  }

  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  if (s3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: `${folder}/${filename}`,
        Body: buffer,
        ContentType: mime === 'image/jpg' ? 'image/jpeg' : mime,
      })
    );
  } else {
    const dir = join(UPLOAD_ROOT, folder);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), buffer);
  }
  return `/uploads/${folder}/${filename}`;
}
