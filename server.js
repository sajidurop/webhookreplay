'use strict';
// WebhookReplay — real server (Node.js, zero dependencies).
// Serves the UI and runs the real work server-side via /api/* endpoints.
//   npm start  ->  http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, 'data');
fs.mkdirSync(DATA, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.md': 'text/plain', '.txt': 'text/plain' };

function send(res, code, obj, type) {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': type || 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', c => { s += c; if (s.length > 5 * 1024 * 1024) req.destroy(); });
    req.on('end', () => { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { resolve({ _raw: s }); } });
    req.on('error', reject);
  });
}
async function fetchTimeout(url, opts, ms) {
  opts = opts || {}; ms = ms || 12000;
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: c.signal, redirect: 'follow', headers: { 'User-Agent': 'WebhookReplay/1.0.0 (https://alltoolfree.site)', ...(opts.headers || {}) } });
  } finally { clearTimeout(t); }
}
function store(name, rec) {
  const f = path.join(DATA, name + '.json');
  let arr = [];
  try { arr = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) {}
  arr.push({ ...rec, at: new Date().toISOString() });
  if (arr.length > 500) arr = arr.slice(-500);
  fs.writeFileSync(f, JSON.stringify(arr, null, 2));
  return arr;
}
function loadAll(name) {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, name + '.json'), 'utf8')); } catch (e) { return []; }
}
function saveAll(name, arr) {
  fs.writeFileSync(path.join(DATA, name + '.json'), JSON.stringify(arr, null, 2));
}


async function handleCheck(body) {
  if (body.list) return { ok: true, events: loadAll('events').slice(-100).reverse() };
  if (body.replay) {
    const ev = loadAll('events').find(e => e.id === body.replay.id);
    if (!ev) return { error: 'Event not found' };
    try {
      const r = await fetchTimeout(body.replay.targetUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ev.payload) }, 12000);
      return { ok: true, targetStatus: r.status };
    } catch (e) { return { ok: false, error: String(e.message || e) }; }
  }
  if (body.capture) {
    const ev = { id: Math.random().toString(36).slice(2, 10), source: body.capture.source || 'manual', payload: body.capture.payload || {} };
    store('events', ev);
    return { ok: true, event: ev };
  }
  return { error: 'Provide list, capture or replay' };
}


const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && u.pathname === '/api/health') return send(res, 200, { ok: true, product: 'webhookreplay', version: '1.0.0', time: new Date().toISOString() });
    if (req.method === 'GET' && u.pathname === '/api/history') return send(res, 200, loadAll('history'));
    if (req.method === 'POST' && u.pathname.startsWith('/webhook/')) {
      const body = await readBody(req);
      const ev = { id: Math.random().toString(36).slice(2, 10), source: decodeURIComponent(u.pathname.slice(9)), payload: body && body._raw !== undefined ? body._raw : body };
      store('events', ev);
      return send(res, 200, { ok: true, id: ev.id });
    }
    if (req.method === 'POST' && u.pathname === '/api/check') {
      const body = await readBody(req);
      const out = await handleCheck(body);
      return send(res, 200, out);
    }
    if (req.method === 'GET') {
      const p = u.pathname === '/' ? '/index.html' : u.pathname;
      const fp = path.join(__dirname, p);
      if (!fp.startsWith(__dirname)) return send(res, 403, { error: 'forbidden' });
      if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
        return fs.createReadStream(fp).pipe(res);
      }
      return send(res, 404, { error: 'not found' });
    }
    return send(res, 404, { error: 'unknown route' });
  } catch (e) {
    return send(res, 500, { error: String((e && e.message) || e) });
  }
});
server.listen(PORT, () => console.log('WebhookReplay listening on http://localhost:' + PORT));

