import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../dist/dipali/browser/', import.meta.url));
const port = Number(process.env.PORT ?? 4201);
const basePath = process.env.PREVIEW_BASE_PATH ?? '/';
assert(
  /^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(basePath),
  'PREVIEW_BASE_PATH must start and end with /.',
);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (basePath !== '/' && requestPath === basePath.slice(0, -1)) {
      response.writeHead(308, { Location: basePath }).end();
      return;
    }
    if (!requestPath.startsWith(basePath)) {
      response.writeHead(404).end('Not found');
      return;
    }
    const path = '/' + requestPath.slice(basePath.length);
    const target = resolve(root, '.' + path);
    const traversal = relative(root, target);
    if (traversal.startsWith('..' + sep) || traversal === '..' || target.includes('\0')) {
      response.writeHead(403).end();
      return;
    }
    let file = target;
    let status = path.replace(/\/$/, '') === '/not-found' ? 404 : 200;
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      if (!(await stat(file)).isFile()) throw new Error('Not a file');
    } catch {
      status = 404;
      if (extname(path)) {
        response.writeHead(status).end('Not found');
        return;
      }
      file = join(root, 'not-found', 'index.html');
    }
    const information = await stat(file);
    response.writeHead(status, {
      'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
      'Content-Length': information.size,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-cache',
    });
    if (request.method === 'HEAD') response.end();
    else
      createReadStream(file)
        .on('error', () => response.destroy())
        .pipe(response);
  } catch {
    response.writeHead(400).end('Bad request');
  }
});

server.on('error', (error) => {
  console.error(`Preview failed: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () =>
  console.log(`Static preview: http://127.0.0.1:${port}${basePath}`),
);
