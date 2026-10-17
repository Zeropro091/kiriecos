import { Router } from 'express';
import { createReadStream, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { asyncHandler } from '../http/asyncHandler.js';
import { attachUser, requireAuth } from '../auth/middleware.js';
import { UPLOAD_ROOT, useObjectStorage, getObject, OBJECT_KEY_PATTERN } from '../storage/files.js';

export const uploadsRouter = Router();

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

const RESOLVED_ROOT = resolve(UPLOAD_ROOT);

/**
 * GET /uploads/* — authenticated file access.
 * Replaces the public express.static mount:
 *  - requires a valid bearer token,
 *  - rejects path traversal (resolved path must stay inside UPLOAD_ROOT),
 *  - streams the file with a strict content-type allowlist.
 */
uploadsRouter.get(
  '/*',
  attachUser,
  requireAuth,
  asyncHandler(async (req, res) => {
    const raw = req.params[0];
    if (typeof raw !== 'string' || raw.length === 0) {
      res.status(400).json({ error: 'Path berkas tidak valid.' });
      return;
    }

    let relPath: string;
    try {
      relPath = decodeURIComponent(raw);
    } catch {
      res.status(400).json({ error: 'Path berkas tidak valid.' });
      return;
    }

    // Reject null bytes and encoded traversal before resolving.
    if (relPath.includes('\0')) {
      res.status(403).json({ error: 'Akses berkas ditolak.' });
      return;
    }

    if (useObjectStorage) {
      // Bucket mode: only keys we write are accepted, so traversal is impossible.
      if (!OBJECT_KEY_PATTERN.test(relPath)) {
        res.status(403).json({ error: 'Akses berkas ditolak.' });
        return;
      }
      const contentType = CONTENT_TYPES[extname(relPath).toLowerCase()];
      const obj = await getObject(relPath);
      if (!obj) {
        res.status(404).json({ error: 'Berkas tidak ditemukan.' });
        return;
      }
      res.setHeader('Content-Type', contentType);
      if (obj.contentLength !== undefined) res.setHeader('Content-Length', String(obj.contentLength));
      res.setHeader('Cache-Control', 'private, max-age=3600');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      obj.body.on('error', () => {
        if (!res.headersSent) res.status(500).end();
        else res.destroy();
      });
      obj.body.pipe(res);
      return;
    }

    const filePath = resolve(RESOLVED_ROOT, relPath);
    if (filePath !== RESOLVED_ROOT && !filePath.startsWith(RESOLVED_ROOT + sep)) {
      res.status(403).json({ error: 'Akses berkas ditolak.' });
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    if (!contentType) {
      res.status(415).json({ error: 'Tipe berkas tidak didukung.' });
      return;
    }

    let stats;
    try {
      stats = statSync(filePath);
    } catch {
      res.status(404).json({ error: 'Berkas tidak ditemukan.' });
      return;
    }
    if (!stats.isFile()) {
      res.status(404).json({ error: 'Berkas tidak ditemukan.' });
      return;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(stats.size));
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const stream = createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) res.status(500).end();
      else res.destroy();
    });
    stream.pipe(res);
  })
);
