const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname);

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.json': 'application/json',
};

http.createServer((req, res) => {
  const requestPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(publicDir, decodeURIComponent(requestPath.split('?')[0]));

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Solicitud no válida');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('No encontrado');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${3000}`);
});
