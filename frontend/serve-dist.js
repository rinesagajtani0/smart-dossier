import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.FRONTEND_PORT || 5173);

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url || '/', `http://localhost:${port}`).pathname);
  const requestedPath = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.normalize(path.join(distDir, requestedPath));

  if (!filePath.startsWith(distDir)) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (!error) {
      send(res, 200, data, types[path.extname(filePath)] || 'application/octet-stream');
      return;
    }

    fs.readFile(path.join(distDir, 'index.html'), (indexError, indexData) => {
      if (indexError) {
        send(res, 404, 'Run npm run build first.');
        return;
      }
      send(res, 200, indexData, types['.html']);
    });
  });
});

server.listen(port, () => {
  console.log(`Smart Dossier frontend listening on http://localhost:${port}`);
});
