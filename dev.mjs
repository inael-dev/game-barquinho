// local stand-in for `vercel dev`: static files + /api/* handlers on :3050
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^(\w+)="?(.*?)"?$/); if (m) process.env[m[1]] ??= m[2];
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp3': 'audio/mpeg', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) {
    const name = url.pathname.slice(5).replace(/[^a-z]/g, '');
    let body = '';
    for await (const c of req) body += c;
    req.query = Object.fromEntries(url.searchParams);
    req.body = body && (req.headers['content-type'] || '').includes('json') ? JSON.parse(body) : body;
    res.status = c => { res.statusCode = c; return res; };
    res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    try { (await import(`./api/${name}.js`)).default(req, res); } catch { res.statusCode = 404; res.end(); }
    return;
  }
  const p = normalize(url.pathname === '/' ? '/index.html' : url.pathname);
  try { const data = await readFile(join(process.cwd(), p)); res.setHeader('Content-Type', TYPES[extname(p)] || 'application/octet-stream'); res.end(data); }
  catch { res.statusCode = 404; res.end('not found'); }
}).listen(3050, () => console.log('http://localhost:3050'));
