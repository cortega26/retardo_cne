const http = require('http');
const fs = require('fs');
const path = require('path');

const workspaceDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(workspaceDir, process.argv[2] || 'dist');
const port = Number(process.env.PORT) || 4173;
const basePath = process.env.BASE_PATH || '/retardo_cne';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function resolveFilePath(requestUrl) {
  const safePath = requestUrl.split('?')[0].split('#')[0];
  let decoded = decodeURIComponent(safePath);
  if (decoded === basePath || decoded.startsWith(`${basePath}/`)) {
    decoded = decoded.slice(basePath.length) || '/';
  }
  const relativePath = decoded === '/' || decoded.endsWith('/') ? `${decoded}index.html` : decoded;
  const fullPath = path.join(rootDir, relativePath);
  const normalized = path.normalize(fullPath);

  if (!normalized.startsWith(rootDir)) {
    return null;
  }

  return normalized;
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  const filePath = resolveFilePath(req.url);
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static server running at http://127.0.0.1:${port}`);
  console.log(`Serving ${rootDir}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
