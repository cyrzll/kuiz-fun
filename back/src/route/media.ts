import { Hono } from 'hono';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mediaDir = path.join(__dirname, '../media');
if (!existsSync(mediaDir)) {
  mediaDir = path.join(__dirname, '../../src/media');
}

const router = new Hono();

router.get('/:filename', async (c) => {
  const filename = c.req.param('filename');
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return c.json({ error: 'Invalid filename' }, 400);
  }

  const filePath = path.join(mediaDir, filename);
  if (!existsSync(filePath)) {
    return c.json({ error: 'File not found' }, 404);
  }

  let contentType = 'application/octet-stream';
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.webp') {
    contentType = 'image/webp';
  } else if (ext === '.png') {
    contentType = 'image/png';
  } else if (ext === '.jpg' || ext === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (ext === '.gif') {
    contentType = 'image/gif';
  } else if (ext === '.svg') {
    contentType = 'image/svg+xml';
  }

  c.header('Content-Type', contentType);
  c.header('Cache-Control', 'public, max-age=31536000, immutable');

  try {
    const fileBuffer = readFileSync(filePath);
    return c.body(fileBuffer);
  } catch (err: any) {
    return c.json({ error: 'Failed to read file' }, 500);
  }
});

export default router;
