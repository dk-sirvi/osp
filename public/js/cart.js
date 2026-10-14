// Cart (saved in the visitor's browser) + WhatsApp checkout
const Cart = {
  items: {},
  init() { try { this.items = JSON.parse(localStorage.getItem('osp_cart') || '{}'); } catch { this.items = {}; } this.update(); },
  find(id) { return SITE.products.find(p => p.id === id); },
  add(id) { this.items[id] = (this.items[id] || 0) + 1; this.update(); toast('Added to cart'); },
  change(id, d) { this.items[id] = (this.items[id] || 0) + d; if (this.items[id] <= 0) delete this.items[id]; this.update(); },
  update() {
    Object.keys(this.items).forEach(id => !this.find(id) && delete this.items[id]);
    try { localStorage.setItem('osp_cart', JSON.stringify(this.items)); } catch {}
    const ids = Object.keys(this.items); let total = 0;
    $('cc').textContent = ids.reduce((a, i) => a + this.items[i], 0);
    $('items').innerHTML = ids.length ? ids.map(id => { const p = this.find(id); total += p.price * this.items[id];
      const icon = (SITE.categories.find(c => c.name === p.category) || {}).icon || '🍬';
      return `<div class="li">${p.image ? `<img class="e" src="${esc(safeUrl(p.image))}" alt="">` : `<span class="e">${esc(icon)}</span>`}<div><b>${esc(p.name)}</b><br>${money(p.price)}</div><div class="q"><button data-m="${esc(id)}">−</button>${this.items[id]}<button data-a="${esc(id)}">+</button></div></div>`; }).join('')
      : '<p style="color:#6f655e;text-align:center;margin-top:40px">Your cart is empty.</p>';
    $('tot').textContent = money(total);
  },
  checkout() {
    const ids = Object.keys(this.items); if (!ids.length) return toast('Cart is empty');
    let total = 0; const lines = ids.map(id => { const p = this.find(id); total += p.price * this.items[id]; return `${this.items[id]} x ${p.name} (${money(p.price * this.items[id])})`; });
    const msg = `Hello ${SITE.settings.name}! I would like to order:\n${lines.join('\n')}\nTotal: ${money(total)}`;
    window.open(`https://wa.me/${SITE.settings.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }
};
