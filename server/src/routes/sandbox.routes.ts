import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../http/asyncHandler.js';
import { getEntity } from '../repositories/entities.js';
import { env } from '../config.js';

export const sandboxRouter = Router();

/**
 * Developer-built custom landing page preview.
 *
 * The document is rendered here (not via an iframe `srcdoc`) so it can carry its
 * OWN relaxed Content-Security-Policy: Tailwind's CDN + inline <style>/<script>
 * are required by the developer sandbox, while the strict app CSP stays intact
 * for every other page. The iframe sandbox attribute still isolates it.
 */
function escapeForInline(value: string): string {
  // Prevent the developer-provided content from breaking out of the surrounding
  // <script> tag; the content is intentionally untrusted-but-isolated.
  return value.replace(/<\/script/gi, '<\\/script');
}

sandboxRouter.get(
  '/landing/:entityId',
  asyncHandler(async (req, res) => {
    if (!z.string().uuid().safeParse(req.params.entityId).success) {
      res.status(400).json({ error: 'ID entitas tidak valid.' });
      return;
    }

    const entity = await getEntity(req.params.entityId);
    if (!entity || !entity.customLandingPageActive || !entity.customHtml) {
      res.status(404).json({ error: 'Landing page kustom tidak ditemukan.' });
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner =
      req.user?.entityId === entity.id || entity.ownerProfileId === req.user?.id;
    if (entity.verificationStatus !== 'approved' && !isAdmin && !isOwner) {
      res.status(404).json({ error: 'Landing page kustom tidak ditemukan.' });
      return;
    }

    const document = `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Cinzel:wght@600;800&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Plus Jakarta Sans', sans-serif; }
      ${entity.customCss || ''}
    </style>
  </head>
  <body class="bg-slate-950 text-slate-100 min-h-screen">
    ${entity.customHtml}
    <script>
      try {
        ${escapeForInline(entity.customJs || '')}
      } catch (err) {
        console.error('Custom Sandbox JS Error:', err);
      }
    </script>
  </body>
</html>`;

    const frameAncestors = ["'self'", ...env.CORS_ORIGINS].join(' ');
    res.removeHeader('Content-Security-Policy');
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'none'",
        "script-src 'unsafe-inline' https://cdn.tailwindcss.com",
        "style-src 'unsafe-inline' https://fonts.googleapis.com",
        'font-src https://fonts.gstatic.com data:',
        'img-src * data: blob:',
        'media-src * data: blob:',
        "connect-src 'none'",
        `frame-ancestors ${frameAncestors}`,
        "base-uri 'none'",
        "form-action 'none'",
      ].join('; ')
    );
    res.setHeader('Cache-Control', 'no-store');
    res.type('html').send(document);
  })
);
