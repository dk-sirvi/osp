// Orang Sweet Plazza: zero-dependency Node server (site + admin API + uploads)
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ROOT = __dirname, PUB = path.join(ROOT, 'public'), UP = path.join(ROOT, 'uploads');
const DATA = path.join(ROOT, 'data', 'site.json');
fs.mkdirSync(UP, { recursive: true });
const MIME = { '.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif',
  '.mp4':'video/mp4','.webm':'video/webm','.ico':'image/x-icon' };
const UPLOAD_EXT = ['.png','.jpg','.jpeg','.webp','.gif','.mp4','.webm'];
const sessions = new Map(), attempts = new Map();
const send = (res, code, body, type = 'application/json', extra = {}) => {
  res.writeHead(code, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const readBody = (req, limit) => new Promise((ok, no) => {
  let size = 0; const chunks = [];
  req.on('data', c => { size += c.length; if (size > limit) { no(new Error('too large')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => ok(Buffer.concat(chunks).toString('utf8'))); req.on('error', no);
});
const cookie = req => Object.fromEntries((req.headers.cookie || '').split(';').map(s => s.trim().split('=')).filter(p => p[0]));
const authed = req => { const t = cookie(req).sid, exp = sessions.get(t); return !!exp && exp > Date.now(); };
const safeEq = (a, b) => { const x = crypto.createHash('sha256').update(a).digest(), y = crypto.createHash('sha256').update(b).digest(); return crypto.timingSafeEqual(x, y); };

async function api(req, res, url) {
  const p = url.pathname;
  if (p === '/api/site' && req.method === 'GET') return send(res, 200, fs.readFileSync(DATA), 'application/json', { 'Cache-Control': 'no-store' });
  if (p === '/api/login' && req.method === 'POST') {
    const ip = req.socket.remoteAddress, a = attempts.get(ip) || { n: 0, t: Date.now() };
    if (Date.now() - a.t > 9e5) { a.n = 0; a.t = Date.now(); }
    if (a.n >= 10) return send(res, 429, { error: 'Too many attempts. Try again later.' });
    const { password = '' } = JSON.parse(await readBody(req, 1e4) || '{}');
    if (!safeEq(String(password), ADMIN_PASSWORD)) { a.n++; attempts.set(ip, a); return send(res, 401, { error: 'Wrong password' }); }
    const sid = crypto.randomBytes(24).toString('hex'); sessions.set(sid, Date.now() + 864e5);
    return send(res, 200, { ok: true }, 'application/json', { 'Set-Cookie': `sid=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400` });
  }

  if (p === '/api/logout') { sessions.delete(cookie(req).sid); return send(res, 200, { ok: true }, 'application/json', { 'Set-Cookie': 'sid=; Max-Age=0; Path=/' }); }
  if (!authed(req)) return send(res, 401, { error: 'Not logged in' });
  if (p === '/api/me') return send(res, 200, { ok: true, defaultPassword: ADMIN_PASSWORD === 'admin123' });
  if (p === '/api/site' && req.method === 'PUT') {
    const data = JSON.parse(await readBody(req, 5e6));
    if (typeof data !== 'object' || !data || Array.isArray(data)) return send(res, 400, { error: 'Invalid data' });
    if (fs.existsSync(DATA)) fs.copyFileSync(DATA, DATA.replace('.json', '.backup.json'));
    fs.writeFileSync(DATA + '.tmp', JSON.stringify(data, null, 2)); fs.renameSync(DATA + '.tmp', DATA);
    return send(res, 200, { ok: true });
  }
  if (p === '/api/upload' && req.method === 'POST') {
    const { name = '', data = '' } = JSON.parse(await readBody(req, 160e6));
    const ext = path.extname(name).toLowerCase(); if (!UPLOAD_EXT.includes(ext)) return send(res, 400, { error: 'File type not allowed' });
    const base = path.basename(name, ext).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'file';
    const file = `${Date.now()}-${base}${ext}`;
    fs.writeFileSync(path.join(UP, file), Buffer.from(data.split(',').pop(), 'base64'));
    return send(res, 200, { url: '/uploads/' + file });
  }
  if (p === '/api/media' && req.method === 'GET')
    return send(res, 200, fs.readdirSync(UP).filter(f => UPLOAD_EXT.includes(path.extname(f))).map(f => ({ name: f, url: '/uploads/' + f, size: fs.statSync(path.join(UP, f)).size })));
  if (p.startsWith('/api/media/') && req.method === 'DELETE') {
    const f = path.basename(decodeURIComponent(p.slice(11))), fp = path.join(UP, f);
    if (fs.existsSync(fp)) fs.unlinkSync(fp); return send(res, 200, { ok: true });
  }
  send(res, 404, { error: 'Not found' });
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/admin') { res.writeHead(302, { Location: '/admin/' }); return res.end(); }
    const base = rel.startsWith('/uploads/') ? UP : PUB, sub = rel.startsWith('/uploads/') ? rel.slice(9) : rel;
    let fp = path.normalize(path.join(base, sub));
    if (!fp.startsWith(base)) return send(res, 403, 'Forbidden', 'text/plain');
    if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
    if (!fs.existsSync(fp)) return send(res, 404, 'Not found', 'text/plain');
    const type = MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream', size = fs.statSync(fp).size, range = req.headers.range;
    if (range && type.startsWith('video')) { // video seeking support
      const [s, e] = range.replace('bytes=', '').split('-'), start = +s || 0, end = e ? +e : size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      return fs.createReadStream(fp, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes' });
    fs.createReadStream(fp).pipe(res);
  } catch (e) { send(res, 500, { error: 'Server error' }); }
}).listen(PORT, () => {
  console.log(`Site:  http://localhost:${PORT}\nAdmin: http://localhost:${PORT}/admin/`);
  if (ADMIN_PASSWORD === 'admin123') console.warn('WARNING: using default admin password. Set ADMIN_PASSWORD before going live.');
});
