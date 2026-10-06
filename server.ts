import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // In-flight deduplication map so if multiple concurrent users/tabs fetch the same external image URL
  // simultaneously, only 1 upstream network request is made and shared across all waiting callers.
  const inFlightImageFetches = new Map<string, Promise<{ buffer: Buffer; contentType: string }>>();
  const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB safety cap per proxied image

  // Server-side proxy to fetch full-resolution linked PDF attachment images
  // without browser CORS restrictions (e.g., CloudFront / S3 / CDN URLs)
  app.get('/api/proxy-image', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
    if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) {
      res.status(400).json({ error: 'Invalid or missing image URL' });
      return;
    }

    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        res.status(400).json({ error: 'Unsupported protocol' });
        return;
      }

      // Block localhost / loopback / private network SSRF attempts
      const host = parsed.hostname.toLowerCase();
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '0.0.0.0' ||
        host === '::1' ||
        host.startsWith('169.254.')
      ) {
        res.status(403).json({ error: 'Loopback and link-local addresses are not allowed' });
        return;
      }

      const targetUrl = parsed.toString();
      let fetchPromise = inFlightImageFetches.get(targetUrl);

      if (!fetchPromise) {
        fetchPromise = (async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          try {
            const upstream = await fetch(targetUrl, {
              signal: controller.signal,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
              }
            });
            clearTimeout(timeoutId);

            if (!upstream.ok) {
              throw new Error(`Upstream HTTP ${upstream.status}`);
            }

            const contentLength = Number(upstream.headers.get('content-length') || 0);
            if (contentLength > MAX_IMAGE_BYTES) {
              throw new Error('Image exceeds maximum allowed size (15 MB)');
            }

            const contentType = upstream.headers.get('content-type') || 'image/jpeg';
            const arrayBuffer = await upstream.arrayBuffer();
            if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
              throw new Error('Image exceeds maximum allowed size (15 MB)');
            }

            return {
              buffer: Buffer.from(arrayBuffer),
              contentType
            };
          } finally {
            clearTimeout(timeoutId);
            inFlightImageFetches.delete(targetUrl);
          }
        })();

        inFlightImageFetches.set(targetUrl, fetchPromise);
      }

      const { buffer, contentType } = await fetchPromise;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(buffer);
    } catch (err: any) {
      res.status(502).json({ error: err?.message || 'Failed to fetch upstream image' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
