import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const PORT = Number(process.env.PORT || 5173);
const ROOT = process.cwd();

const clients = new Set();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const LIVE_RELOAD_SNIPPET = `
<script>
(() => {
  const es = new EventSource('/__live_reload');
  es.onmessage = (e) => {
    if (e.data === 'reload') location.reload();
  };
})();
</script>
`;

const server = http.createServer((req, res) => {
  const reqUrl = (req.url || '/').split('?')[0];

  if (reqUrl === '/__live_reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('data: connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  let filePath = path.join(ROOT, reqUrl === '/' ? 'index.html' : reqUrl);

  // Resolve extensionless TypeScript imports in ES modules (e.g. import './types' or './types.ts')
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.ts')) {
      filePath = filePath + '.ts';
    } else if (reqUrl.endsWith('.js') && fs.existsSync(filePath.slice(0, -3) + '.ts')) {
      filePath = filePath.slice(0, -3) + '.ts';
    }
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found: ' + reqUrl);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === '.ts') {
      const source = fs.readFileSync(filePath, 'utf8');
      const result = ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
          sourceMap: true,
        },
        fileName: path.basename(filePath),
      });
      res.writeHead(200, {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(result.outputText);
      return;
    }

    if (ext === '.html') {
      let html = fs.readFileSync(filePath, 'utf8');
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${LIVE_RELOAD_SNIPPET}</body>`);
      } else {
        html += LIVE_RELOAD_SNIPPET;
      }
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(html);
      return;
    }

    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(content);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error: ' + String(err));
  }
});

// Watch src/ and index.html for instant reload
const watchTargets = ['index.html', 'src'];
for (const target of watchTargets) {
  const full = path.join(ROOT, target);
  try {
    if (fs.existsSync(full)) {
      fs.watch(full, { recursive: true }, () => {
        for (const client of clients) {
          client.write('data: reload\n\n');
        }
      });
    }
  } catch {
    // ignore watch errors on network filesystem if unsupported
  }
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Shattered Covenant dev server running at http://localhost:${PORT}`);
});
