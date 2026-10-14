// Diwali fireworks + floating sparks on the hero canvas
const FX = {
  start() {
    const c = $('fx'); if (!c) return; const x = c.getContext('2d');
    let W, H, P = [];
    const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
    resize(); addEventListener('resize', resize);
    const cols = ['#ffd27a', '#fff', '#ffb347', '#ff7a3c', '#ffe9b0'];
    const sparks = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2 + .5, v: Math.random() * .6 + .2, a: Math.random() * 6 }));
    const burst = () => {
      const bx = W * (.15 + Math.random() * .7), by = H * (.12 + Math.random() * .4), col = cols[Math.random() * cols.length | 0];
      for (let i = 0; i < 70; i++) { const a = i / 70 * 6.283, s = Math.random() * 4 + 1.5; P.push({ x: bx, y: by, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, col }); }
    };
    const still = matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (!still) setInterval(() => !document.hidden && burst(), 1100);
    burst();
    (function loop() {
      x.clearRect(0, 0, W, H);
      sparks.forEach(s => { s.y -= s.v; s.a += .04; if (s.y < 0) { s.y = H; s.x = Math.random() * W; } x.globalAlpha = .4 + .4 * Math.sin(s.a); x.fillStyle = '#ffe9b0'; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill(); });
      P = P.filter(p => p.l > 0);
      P.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .05; p.vx *= .985; p.l -= .013; x.globalAlpha = Math.max(p.l, 0); x.fillStyle = p.col; x.beginPath(); x.arc(p.x, p.y, 2, 0, 6.283); x.fill(); });
      x.globalAlpha = 1; if (!still) requestAnimationFrame(loop);
    })();
  }
};
