// Разноцветное конфетти, вылетающее с обоих боков canvas.
const COLORS = ['#ff4fa3', '#ffd23f', '#3ddc4a', '#4fc3ff', '#b36bff', '#ff8a3d', '#ffffff'];

export function burstConfetti(canvas, { count = 140, duration = 2800 } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const parts = Array.from({ length: count }, (_, i) => {
    const left = i % 2 === 0;
    const angle = (left ? -1 : -Math.PI + 1) + (Math.random() - 0.5) * 0.9; // вверх и к центру
    const speed = 7 + Math.random() * 7;
    return {
      x: left ? -10 : w + 10, y: h * (0.45 + Math.random() * 0.2),
      vx: Math.cos(angle) * speed * (left ? 1 : 1), vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 6, rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[(Math.random() * COLORS.length) | 0], shape: Math.random() < 0.7 ? 'rect' : 'circle',
      flip: Math.random() * Math.PI,
    };
  });

  const start = performance.now();
  const frame = now => {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    const fade = Math.max(0, 1 - Math.max(0, t - duration + 700) / 700);
    for (const p of parts) {
      p.vy += 0.22; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.flip += 0.2;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4 * Math.abs(Math.cos(p.flip)) - 1, p.size, p.size / 2 * Math.abs(Math.cos(p.flip)) + 2);
      else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2.6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    if (t < duration) requestAnimationFrame(frame); else ctx.clearRect(0, 0, w, h);
  };
  requestAnimationFrame(frame);
}
