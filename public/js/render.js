// Builds every page section from the site JSON (editable in /admin)
const Render = {
  all(S) {
    const st = S.settings;
    document.documentElement.style.setProperty('--or', st.primaryColor || '#e8650a');
    document.querySelector('meta[name=theme-color]').content = st.primaryColor || '#e8650a';
    document.title = `${st.name} | ${st.tagline}`;
    $('ann').textContent = st.announcement || '';
    this.header(S); this.hero(S); this.categories(S); this.trust(S); this.bands(S); this.story(S); this.corporate(S); this.outlets(S); this.footer(S);
    $('waFloat').href = `https://wa.me/${st.whatsapp}?text=${encodeURIComponent('Hello ' + st.name + '! I have an enquiry.')}`;
  },
  header(S) {
    const cats = S.categories, groups = [...new Set(cats.map(c => c.group).filter(g => g && g !== 'None'))];
    const dd = g => `<div><a href="#shop">${esc(g)} ▾</a><div class="dd">${cats.filter(c => c.group === g).map(c => `<a href="#shop" data-cat="${esc(c.name)}">${esc(c.name)}</a>`).join('')}</div></div>`;
    const single = cats.filter(c => !c.group || c.group === 'None').map(c => `<div><a href="#shop" data-cat="${esc(c.name)}">${esc(c.name)}</a></div>`).join('');
    const words = S.settings.name.split(' ');
    $('header').innerHTML = `<div class="wrap hrow">
    <a class="logo" href="#home">
      <div class="logo-emblem">${esc(S.settings.name[0] || 'S')}</div>
      <div class="logo-text"><span>${esc(words[0])}</span><small>${esc(words.slice(1).join(' '))}</small></div>
    </a>
    <nav id="nav">${groups.map(dd).join('')}${single}<div><a href="#corporate">Corporate Gifting</a></div><div><a href="#outlets">Our Outlets</a></div><div><a href="#outlets">Contact</a></div></nav>
    <div class="icons"><button class="ib" id="sBtn" aria-label="Search">🔍</button><button class="ib" id="lBtn" aria-label="Offers">👤</button><button class="ib" id="cBtn" aria-label="Cart">🛒<span class="badge" id="cc">0</span></button><button class="ib burger" id="bg" aria-label="Menu">☰</button></div></div>`;
  },
  hero(S) {
    const h = S.hero, u = h.videoUrl || '', yt = u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
    let media = '';
    if (yt) media = `<iframe class="hero-media" src="https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0&rel=0&modestbranding=1" allow="autoplay" title="Welcome video"></iframe>`;
    else if (u) media = `<video class="hero-media" src="${esc(safeUrl(u))}" poster="${esc(safeUrl(h.posterUrl))}" autoplay muted loop playsinline></video>`;
    else if (h.posterUrl) media = `<div class="hero-media" style="background:url('${esc(safeUrl(h.posterUrl))}') center/cover"></div>`;
    $('home').innerHTML = `${media}${h.fireworks ? '<canvas id="fx" aria-hidden="true"></canvas>' : ''}
    <div class="in"><div class="tag">${esc(h.eyebrow)}</div><h1>${esc(h.title)}</h1><p>${esc(h.text)}</p>
    <div class="btns">${h.btn1Text ? `<a class="btn" href="${esc(safeUrl(h.btn1Link))}">${esc(h.btn1Text)}</a>` : ''}${h.btn2Text ? `<a class="btn ghost" href="${esc(safeUrl(h.btn2Link))}">${esc(h.btn2Text)}</a>` : ''}</div></div>
    ${h.fireworks ? '<div class="diyas" aria-hidden="true"><span>🪔</span><span>✨</span><span>🪔</span><span>✨</span><span>🪔</span><span>✨</span><span>🪔</span></div>' : ''}`;
    if (h.fireworks) FX.start();
  },
  categories(S) {
    const list = S.categories.filter(c => c.home);
    $('categories').innerHTML = list.length ? `<div class="wrap"><div class="sec-head"><h2>Shop Our Range</h2><div class="orn">✦</div><p>Freshly made every day with carefully selected ingredients.</p></div><div class="grid4">${list.map(c =>
      `<a class="tile ${c.image ? 'img' : ''}" href="#shop" data-cat="${esc(c.name)}" ${c.image ? `style="background-image:url('${esc(safeUrl(c.image))}')"` : ''}>${c.image ? '' : `<span>${esc(c.icon)}</span>`}<b>${esc(c.name)}</b></a>`).join('')}</div></div>` : '';
  },
  trust(S) { $('trust').innerHTML = `<div class="wrap grid4">${S.trust.map(t => `<div><span>${esc(t.icon)}</span><b>${esc(t.title)}</b><small>${esc(t.text)}</small></div>`).join('')}</div>`; },
  bands(S) { $('bands').innerHTML = ''; },
  story(S) { const s = S.story; $('story').innerHTML = `<div class="wrap">${s.image ? `<img src="${esc(safeUrl(s.image))}" alt="${esc(s.title)}" loading="lazy">` : ''}<div class="sec-head"><h2>${esc(s.title)}</h2><div class="orn">✦</div></div><p>${esc(s.text1)}</p><p>${esc(s.text2)}</p></div>`; },
  corporate(S) {
    const c = S.corporate, w = S.settings.whatsapp;
    $('corporate').innerHTML = `<div class="wrap"><div class="sec-head"><h2>${esc(c.title)}</h2><div class="orn">✦</div><p class="sub">${esc(c.text)}</p></div><div style="text-align:center"><a class="btn gold" target="_blank" rel="noopener" href="https://wa.me/${esc(w)}?text=${encodeURIComponent('Hello ' + S.settings.name + ', I am interested in bulk gifting.')}">${esc(c.btnText)}</a></div></div>`;
  },
  outlets(S) {
    $('outlets').innerHTML = `<div class="wrap"><div class="sec-head"><h2>Our Outlets</h2><div class="orn">✦</div><p>Visit us or call for prices, availability and custom orders.</p></div><div class="outlets">${S.outlets.map(o =>
      `<div class="box"><h3>${esc(o.name)}</h3><p>${esc(o.address)}<br>${esc(o.hours)}<br><b>${esc(o.phone)}</b></p>${o.mapUrl ? `<a class="btn sm outline" target="_blank" rel="noopener" href="${esc(safeUrl(o.mapUrl))}">Get directions</a> ` : ''}${o.phone ? `<a class="btn sm" href="tel:${esc(o.phone.replace(/[^\d+]/g, ''))}">Call</a>` : ''}</div>`).join('')}</div></div>`;
  },
  footer(S) {
    const st = S.settings, f = S.footer;
    $('footer').innerHTML = `<div class="wrap"><div class="fg">
    <div><div class="footer-logo">${esc(st.name)}</div><p class="footer-about">${esc(f.about)}</p><div class="footer-contact"><b>📞</b> ${esc(st.phone)}<br><b>✉</b> ${esc(st.email)}<br><b>📍</b> ${esc(st.address)}</div></div>
    <div><h4>Our Range</h4><ul>${S.categories.slice(0, 6).map(c => `<li><a href="#shop" data-cat="${esc(c.name)}">${esc(c.name)}</a></li>`).join('')}</ul></div>
    <div><h4>Quick Links</h4><ul>${f.links.map(l => `<li><a href="${esc(safeUrl(l.url))}">${esc(l.label)}</a></li>`).join('')}</ul></div>
    <div><h4>Stay Connected</h4><p style="font-size:13px;color:#B8A890;margin-bottom:14px">Get updates on new arrivals and festive offers.</p><form class="nl" id="nl"><input type="email" required placeholder="Your email" aria-label="Email"><button class="btn sm">→</button></form></div></div>
    <div class="cp">© ${new Date().getFullYear()} ${esc(st.name)}. All rights reserved.</div></div>`;
  },
  shop(S, cat, q) {
    const cats = ['All', ...S.categories.map(c => c.name)];
    $('shop').innerHTML = `<div class="wrap"><div class="sec-head"><h2>Our Menu</h2><div class="orn">✦</div><p>Add your favourites to the cart and send your order on WhatsApp.</p></div><div class="tabs">${cats.map(c => `<button class="tab ${c === cat ? 'on' : ''}" data-t="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="pgrid">${
      (() => {
        const list = S.products.filter(p => p.available !== false && (cat === 'All' || p.category === cat) && `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
        return list.length ? list.map(p => { const icon = (S.categories.find(c => c.name === p.category) || {}).icon || '🍬';
          return `<article class="card">${p.featured ? '<span class="star">Bestseller</span>' : ''}<div class="ph">${p.image ? `<img loading="lazy" src="${esc(safeUrl(p.image))}" alt="${esc(p.name)}">` : `<span>${esc(icon)}</span>`}</div><div class="ci"><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><span class="pr">${money(p.price)}</span><button class="btn sm" data-add="${esc(p.id)}">Add to Cart</button></div></article>`; }).join('')
          : '<div class="empty">No items found. Try another search.</div>';
      })()}</div></div>`;
  }
};
