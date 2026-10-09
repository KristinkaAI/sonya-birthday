// Объёмное конфетти в розовых оттенках: вылетает из обоих нижних углов, кувыркается в 3D
// (бумажки поворачиваются ребром и темнеют), есть ленточки-серпантин и блестящие кружочки.
const PINKS = ['#ff4fa3', '#ff7ab8', '#ffa6cf', '#ffc9e2', '#e0237f', '#c2185b', '#ffe0ef', '#f06292'];

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const ch = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

export function burstConfetti(canvas, { count = 170, duration = 3200 } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const parts = Array.from({ length: count }, (_, i) => {
    const left = i % 2 === 0;
    // хлопушка: конус вверх и к центру
    const angle = (left ? -1.05 : -Math.PI + 1.05) + (Math.random() - 0.5) * 0.7;
    const speed = 9 + Math.random() * 9;
    const r = Math.random();
    return {
      x: left ? -6 : w + 6, y: h * (0.62 + Math.random() * 0.08),
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      kind: r < 0.62 ? 'paper' : r < 0.82 ? 'ribbon' : 'sequin',
      size: 6 + Math.random() * 7,
      color: PINKS[(Math.random() * PINKS.length) | 0],
      rot: Math.random() * Math.PI * 2, vrot: (Math.random() - 0.5) * 0.25,
      rx: Math.random() * Math.PI * 2, vrx: 0.12 + Math.random() * 0.22,
      ry: Math.random() * Math.PI * 2, vry: 0.05 + Math.random() * 0.15,
      drag: 0.982 + Math.random() * 0.01,
      sway: Math.random() * Math.PI * 2,
    };
  });

  const start = performance.now();
  const frame = now => {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    const fade = Math.max(0, 1 - Math.max(0, t - duration + 800) / 800);
    for (const p of parts) {
      p.vy += 0.24; p.vx *= p.drag; p.vy *= p.drag;
      p.sway += 0.08;
      p.x += p.vx + Math.sin(p.sway) * 0.6; p.y += p.vy;
      p.rot += p.vrot; p.rx += p.vrx; p.ry += p.vry;
      const cx = Math.cos(p.rx), cy = Math.cos(p.ry);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (p.kind === 'paper') {
        // лицевая сторона светлее, изнанка темнее, ребром — почти не видно
        const lit = 0.55 + 0.45 * Math.abs(cx * cy);
        const back = cx * cy < 0;
        ctx.scale(Math.max(0.08, Math.abs(cy)), Math.max(0.08, Math.abs(cx)));
        const g = ctx.createLinearGradient(-p.size / 2, -p.size / 3, p.size / 2, p.size / 3);
        g.addColorStop(0, shade(p.color, lit * (back ? 0.75 : 1.12)));
        g.addColorStop(1, shade(p.color, lit * (back ? 0.6 : 0.9)));
        ctx.fillStyle = g;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
      } else if (p.kind === 'ribbon') {
        // серпантин: извивающаяся ленточка
        ctx.strokeStyle = shade(p.color, 0.75 + 0.35 * Math.abs(cx));
        ctx.lineWidth = 2.6 * Math.max(0.3, Math.abs(cy));
        ctx.lineCap = 'round';
        ctx.beginPath();
        const L = p.size * 2.2;
        for (let s = 0; s <= 10; s++) {
          const yy = -L / 2 + (L * s) / 10;
          const xx = Math.sin(s * 0.9 + p.rx) * p.size * 0.35;
          s ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
        }
        ctx.stroke();
      } else {
        // блестящий кружок с бликом
        const R = p.size / 2.4;
        const g = ctx.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
        g.addColorStop(0, '#fff');
        g.addColorStop(0.35, shade(p.color, 1.1));
        g.addColorStop(1, shade(p.color, 0.65));
        ctx.fillStyle = g;
        ctx.scale(1, Math.max(0.25, Math.abs(cx)));
        ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    if (t < duration) requestAnimationFrame(frame); else ctx.clearRect(0, 0, w, h);
  };
  requestAnimationFrame(frame);
}
