// Shared helpers
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]));
const safeUrl = u => /^(https?:|\/|#|tel:|mailto:)/i.test(u || '') ? u : '#';
function toast(msg) { const t = $('ts'); t.textContent = msg; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1700); }
const money = n => (window.SITE?.settings?.currency || '₹') + Number(n || 0).toLocaleString('en-IN');
const openPanel = el => { el.classList.add('on'); $('ov').classList.add('on'); };
const closeAll = () => document.querySelectorAll('.drawer,.srch,.pop,.ov').forEach(e => e.classList.remove('on'));
