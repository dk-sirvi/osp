// Schema-driven admin: every field of the website is editable from here.
const $ = id => document.getElementById(id);
const F = (k, l, t = 'text', extra = {}) => ({ k, l, t, ...extra });
const GROUPS = ['Sweets', 'Snacks', 'None'];
const SCHEMA = [
  { key: 'settings', label: 'General', kind: 'obj', fields: [
    F('name', 'Shop name'), F('tagline', 'Tagline'), F('announcement', 'Top announcement bar text'), F('primaryColor', 'Brand colour', 'color'),
    F('currency', 'Currency symbol'), F('phone', 'Phone (shown on site)'), F('whatsapp', 'WhatsApp number', 'text', { hint: 'Country code + number, digits only. Example: 919930234856' }),
    F('email', 'Email'), F('address', 'Address', 'area'), F('hours', 'Opening hours'), F('mapsUrl', 'Google Maps link'),
    F('popupEnabled', 'Show welcome popup (phone + coupon)', 'bool'), F('couponCode', 'Coupon code shown after popup')] },
  { key: 'hero', label: 'Welcome / Hero', kind: 'obj', fields: [
    F('eyebrow', 'Small heading'), F('title', 'Main title'), F('text', 'Description', 'area'),
    F('btn1Text', 'Button 1 text'), F('btn1Link', 'Button 1 link'), F('btn2Text', 'Button 2 text'), F('btn2Link', 'Button 2 link'),
    F('videoUrl', 'Background video', 'video', { hint: 'Upload an MP4/WebM, or paste a YouTube link. Leave empty for no video.' }),
    F('posterUrl', 'Background photo / video poster', 'image'), F('fireworks', 'Diwali fireworks + diya animation', 'bool')] },
  { key: 'categories', label: 'Categories', kind: 'list', title: 'name', blank: { name: 'New category', group: 'None', icon: '🍬', image: '', home: false }, fields: [
    F('name', 'Name', 'text', { hint: 'If you rename a category, update its products too.' }), F('group', 'Menu group', 'select', { options: GROUPS }), F('icon', 'Emoji icon (used when no photo)'), F('image', 'Photo', 'image'), F('home', 'Show in "Shop Our Range" on home page', 'bool')] },
  { key: 'products', label: 'Products', kind: 'list', title: 'name', meta: p => `${p.category} · ${p.price}`, search: true,
    blank: () => ({ id: 'p' + Date.now(), name: 'New product', category: DATA.categories[0]?.name || '', price: 0, description: '', image: '', featured: false, available: true }),
    fields: [F('name', 'Name'), F('category', 'Category', 'select', { options: () => DATA.categories.map(c => c.name) }), F('price', 'Price', 'number'), F('description', 'Description', 'area'),
      F('image', 'Photo', 'image'), F('featured', 'Show "Bestseller" tag', 'bool'), F('available', 'Available (untick to hide from website)', 'bool')] },
  { key: 'trust', label: 'Trust badges', kind: 'list', title: 'title', blank: { icon: '⭐', title: 'New badge', text: '' }, fields: [F('icon', 'Emoji'), F('title', 'Title'), F('text', 'Text')] },
  { key: 'bands', label: 'Promo banners', kind: 'list', title: 'title', blank: { title: 'New banner', text: '', btnText: 'Shop now', btnLink: '#shop', image: '', icon: '🎁', dark: false },
    fields: [F('title', 'Title'), F('text', 'Text', 'area'), F('btnText', 'Button text'), F('btnLink', 'Button link'), F('image', 'Photo', 'image'), F('icon', 'Emoji (used when no photo)'), F('dark', 'Solid colour text panel', 'bool')] },
  { key: 'story', label: 'Our Story', kind: 'obj', fields: [F('title', 'Title'), F('text1', 'Paragraph 1', 'area'), F('text2', 'Paragraph 2', 'area'), F('image', 'Photo', 'image')] },
  { key: 'corporate', label: 'Corporate gifting', kind: 'obj', fields: [F('title', 'Title'), F('text', 'Text', 'area'), F('btnText', 'Button text')] },
  { key: 'outlets', label: 'Outlets', kind: 'list', title: 'name', blank: { name: 'New outlet', address: '', hours: '', phone: '', mapUrl: '' },
    fields: [F('name', 'Name'), F('address', 'Address', 'area'), F('hours', 'Hours'), F('phone', 'Phone'), F('mapUrl', 'Google Maps link')] },
  { key: 'footer', label: 'Footer', kind: 'footer' },
  { key: 'media', label: 'Media library', kind: 'media' }
];
let DATA, current = 'settings', dirty = false;
const api = async (url, opt = {}) => { const r = await fetch(url, { ...opt, headers: { 'Content-Type': 'application/json' }, body: opt.body && JSON.stringify(opt.body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.error || 'Error'), { status: r.status }); return j; };
const toast = m => { const t = $('ts'); t.textContent = m; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2000); };
const mark = () => { dirty = true; $('dirty').textContent = '● Unsaved changes'; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]));
const isVideo = u => /\.(mp4|webm)$/i.test(u || '');

async function upload(file) {
  if (file.size > 100e6) throw new Error('File too large (max 100 MB)');
  const data = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = no; r.readAsDataURL(file); });
  return (await api('/api/upload', { method: 'POST', body: { name: file.name, data } })).url;
}
function field(obj, f) {
  const w = document.createElement('div'); w.className = 'f'; const id = 'i' + Math.random().toString(36).slice(2);
  const val = obj[f.k]; let html = '';
  if (f.t === 'bool') html = `<div class="chk"><input type="checkbox" id="${id}" ${val ? 'checked' : ''}><label for="${id}">${f.l}</label></div>`;
  else {
    html = `<label for="${id}">${f.l}</label>`;
    if (f.t === 'area') html += `<textarea id="${id}">${esc(val)}</textarea>`;
    else if (f.t === 'select') { const opts = typeof f.options === 'function' ? f.options() : f.options; html += `<select id="${id}">${[...new Set([...opts, val])].filter(v => v !== undefined).map(o => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`; }
    else if (f.t === 'image' || f.t === 'video') html += `<div class="up"><input type="text" id="${id}" value="${esc(val)}" placeholder="${f.t === 'video' ? 'Upload file or paste URL' : 'Upload photo or paste URL'}"><label class="sm">Upload<input type="file" hidden accept="${f.t === 'video' ? 'video/mp4,video/webm' : 'image/*'}"></label><button type="button" class="sm del" data-clear>Clear</button><span class="pv"></span></div>`;
    else html += `<input id="${id}" type="${f.t === 'number' ? 'number' : f.t === 'color' ? 'color' : 'text'}" ${f.t === 'number' ? 'step="any" min="0"' : ''} value="${esc(val)}">`;
  }
  if (f.hint) html += `<small>${f.hint}</small>`; w.innerHTML = html;
  const inp = w.querySelector('input:not([type=file]),textarea,select');
  const set = v => { obj[f.k] = v; mark(); };
  const preview = () => { const pv = w.querySelector('.pv'); if (!pv) return; const u = inp.value; pv.innerHTML = !u ? '' : (f.t === 'video' || isVideo(u)) ? (/youtu/.test(u) ? '▶' : `<video src="${esc(u)}" muted></video>`) : `<img src="${esc(u)}" alt="">`; };
  inp.addEventListener('input', () => { set(f.t === 'bool' ? inp.checked : f.t === 'number' ? Number(inp.value) : inp.value); preview(); });
  inp.addEventListener('change', () => { if (f.t === 'bool') set(inp.checked); else if (f.t === 'select') set(inp.value); });
  const file = w.querySelector('input[type=file]');
  if (file) { file.onchange = async () => { if (!file.files[0]) return; toast('Uploading…'); try { inp.value = await upload(file.files[0]); set(inp.value); preview(); toast('Uploaded'); } catch (e) { toast(e.message); } }; w.querySelector('[data-clear]').onclick = () => { inp.value = ''; set(''); preview(); }; preview(); }
  return w;
}
const form = (obj, fields) => { const d = document.createElement('div'); fields.forEach(f => d.append(field(obj, f))); return d; };

function renderList(sec, panel) {
  const list = DATA[sec.key]; let filter = '';
  const bar = document.createElement('div'); bar.className = 'bar';
  bar.innerHTML = `<button class="b">+ Add new</button>${sec.search ? '<input placeholder="Search…">' : ''}`; panel.append(bar);
  const box = document.createElement('div'); panel.append(box);
  const draw = () => {
    box.innerHTML = '';
    list.forEach((item, i) => {
      if (filter && !JSON.stringify(item).toLowerCase().includes(filter)) return;
      const d = document.createElement('details'); d.innerHTML = `<summary><b>${esc(item[sec.title] || 'Untitled')}</b><span class="m">${sec.meta ? esc(sec.meta(item)) : ''}</span></summary>`;
      const body = document.createElement('div'); body.className = 'body'; body.append(form(item, sec.fields));
      const acts = document.createElement('div'); acts.className = 'acts';
      acts.innerHTML = '<button class="sm" data-up>↑ Up</button><button class="sm" data-dn>↓ Down</button><button class="sm" data-dup>Duplicate</button><button class="sm del" data-del>Delete</button>';
      acts.onclick = e => { const t = e.target.dataset; if (t.up !== undefined && i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
        else if (t.dn !== undefined && i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
        else if (t.dup !== undefined) list.splice(i + 1, 0, { ...item, ...(item.id ? { id: 'p' + Date.now() } : {}) });
        else if (t.del !== undefined) { if (!confirm('Delete this item?')) return; list.splice(i, 1); } else return; mark(); draw(); };
      body.append(acts); d.append(body); box.append(d);
    });
    if (!box.children.length) box.innerHTML = '<div class="card">Nothing here yet.</div>';
  };
  bar.querySelector('button').onclick = () => { list.unshift(typeof sec.blank === 'function' ? sec.blank() : { ...sec.blank }); mark(); draw(); box.firstChild?.setAttribute('open', ''); };
  bar.querySelector('input')?.addEventListener('input', e => { filter = e.target.value.toLowerCase(); draw(); });
  draw();
}
async function renderMedia(panel) {
  const bar = document.createElement('div'); bar.className = 'bar'; bar.innerHTML = '<label class="b">Upload photo / video<input type="file" hidden multiple accept="image/*,video/mp4,video/webm"></label>'; panel.append(bar);
  const grid = document.createElement('div'); grid.className = 'media'; panel.append(grid);
  const load = async () => { const files = await api('/api/media'); grid.innerHTML = files.length ? files.reverse().map(f => `<div class="it">${isVideo(f.name) ? `<video src="${f.url}" muted></video>` : `<img src="${f.url}" alt="">`}<div>${esc(f.name)}</div><div>${(f.size / 1024).toFixed(0)} KB</div><button class="sm" data-copy="${f.url}">Copy URL</button> <button class="sm del" data-rm="${esc(f.name)}">Delete</button></div>`).join('') : '<div class="card">No uploads yet.</div>'; };
  bar.querySelector('input').onchange = async e => { for (const f of e.target.files) { toast('Uploading ' + f.name); try { await upload(f); } catch (er) { toast(er.message); } } toast('Done'); load(); };
  grid.onclick = async e => { const t = e.target.dataset; if (t.copy) { navigator.clipboard?.writeText(location.origin + t.copy); toast('URL copied'); } if (t.rm && confirm('Delete this file? Any item using it will show no image.')) { await api('/api/media/' + encodeURIComponent(t.rm), { method: 'DELETE' }); load(); } };
  load();
}
function show(key) {
  current = key; const sec = SCHEMA.find(s => s.key === key); $('title').textContent = sec.label; $('save').hidden = sec.kind === 'media';
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === key));
  const p = $('panel'); p.innerHTML = '';
  if (sec.kind === 'obj') { const c = document.createElement('div'); c.className = 'card'; c.append(form(DATA[key], sec.fields)); p.append(c); }
  else if (sec.kind === 'list') renderList(sec, p); else if (sec.kind === 'footer') { DATA.footer.links ||= []; renderFooterList(p); } else renderMedia(p);
}
// footer needs list scoped to DATA.footer.links
function renderFooterList(p) { const f = DATA.footer; const c = document.createElement('div'); c.className = 'card'; c.append(form(f, [F('about', 'About text', 'area')])); p.append(c);
  const h = document.createElement('h3'); h.textContent = 'Legal / footer links'; h.style.margin = '18px 0 10px'; p.append(h);
  DATA.footerLinks = f.links; renderList({ key: 'footerLinks', title: 'label', blank: { label: 'New link', url: '#' }, fields: [F('label', 'Label'), F('url', 'Page link')] }, p); }

async function start() {
  try { const me = await api('/api/me'); $('warn').hidden = !me.defaultPassword; } catch { $('login').hidden = false; return; }
  DATA = await api('/api/site'); $('login').hidden = true; $('app').hidden = false;
  $('tabs').innerHTML = SCHEMA.map(s => `<button data-k="${s.key}">${s.label}</button>`).join('');
  $('tabs').onclick = e => e.target.dataset.k && show(e.target.dataset.k); show(current);
}
// Step 1: password
$('lf').onsubmit = async e => {
  e.preventDefault(); $('le').textContent = '';
  try {
    await api('/api/login', { method: 'POST', body: { password: $('pw').value } });
    start();
  } catch (er) { $('le').textContent = er.message; }
};
$('lo').onclick = async () => { await api('/api/logout'); location.reload(); };
$('save').onclick = async () => { try { delete DATA.footerLinks; await api('/api/site', { method: 'PUT', body: DATA }); dirty = false; $('dirty').textContent = ''; toast('Saved. Website updated.'); } catch (e) { toast(e.status === 401 ? 'Session expired. Log in again.' : e.message); } };
addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
start();
