// Bootstrap: load content from the API, render, wire up events
(async () => {
  let S;
  try { S = await (await fetch('/api/site', { cache: 'no-store' })).json(); }
  catch { document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif">Site is starting up. Please refresh in a moment.</p>'; return; }
  window.SITE = S; let cat = 'All', q = '';
  Render.all(S); const shop = () => Render.shop(S, cat, q); shop(); Cart.init();
  $('cpCode').textContent = S.settings.couponCode || '';
  document.addEventListener('click', e => {
    const g = s => e.target.closest(s);
    if (g('[data-add]')) Cart.add(g('[data-add]').dataset.add);
    else if (g('[data-a]')) Cart.change(g('[data-a]').dataset.a, 1);
    else if (g('[data-m]')) Cart.change(g('[data-m]').dataset.m, -1);
    else if (g('[data-t]')) { cat = g('[data-t]').dataset.t; shop(); }
    else if (g('[data-cat]')) { cat = g('[data-cat]').dataset.cat; q = ''; shop(); $('nav').classList.remove('on'); }
    else if (g('#cBtn')) openPanel($('dr'));
    else if (g('#sBtn')) { openPanel($('sr')); $('si').focus(); }
    else if (g('#lBtn')) openPanel($('pl'));
    else if (g('#bg')) $('nav').classList.toggle('on');
    else if (g('#co')) Cart.checkout();
    else if (g('#pb')) { if ($('ph').value.replace(/\D/g, '').length < 10) return toast('Enter a valid phone number'); closeAll(); S.settings.couponCode ? openPanel($('pc')) : toast('Thank you!'); }
    else if (g('#cpb')) { navigator.clipboard?.writeText(S.settings.couponCode).catch(() => {}); toast('Code copied'); }
    else if (g('[data-close]') || e.target === $('ov')) closeAll();
  });
  document.addEventListener('submit', e => { if (e.target.id === 'nl') { e.preventDefault(); e.target.reset(); toast('Thanks for subscribing!'); } });
  $('si').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); cat = 'All'; shop(); $('shop').scrollIntoView(); });
  document.addEventListener('keydown', e => e.key === 'Escape' && closeAll());
  if (S.settings.popupEnabled && !sessionStorage.getItem('osp_pop')) setTimeout(() => { openPanel($('pl')); sessionStorage.setItem('osp_pop', 1); }, 6000);
})();
