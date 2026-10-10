// Финал: обратный отсчёт и алмаз, следующий за головой.
import { FINAL_TRACK } from './final-track.js?v=20261010180653';
import { countdown, pad2 } from './logic.js?v=20261010180653';

export function initFinal(partyISO) {
  const target = Date.parse(partyISO);
  const el = id => document.getElementById(id);
  const box = el('countdown'), started = el('started');

  const tick = () => {
    const c = countdown(Date.now(), target);
    el('cdDays').textContent = pad2(c.days);
    el('cdHours').textContent = pad2(c.hours);
    el('cdMinutes').textContent = pad2(c.minutes);
    el('cdSeconds').textContent = pad2(c.seconds);
    box.hidden = c.started;
    started.hidden = !c.started;
  };
  tick();
  setInterval(tick, 1000);

  // Алмаз над головой следует за макушкой по таблице FINAL_TRACK
  const video = el('finalVideo');
  const gem = document.querySelector('.plumbob--final');
  const stage = video.parentElement;
  const at = t => {
    const tr = FINAL_TRACK, d = video.duration || tr[tr.length - 1][0];
    t = ((t % d) + d) % d;
    let i = tr.findIndex(p => p[0] > t);
    if (i <= 0) i = i === 0 ? 1 : tr.length - 1;
    const a = tr[i - 1], b = tr[i], k = Math.min(1, Math.max(0, (t - a[0]) / ((b[0] - a[0]) || 1)));
    return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  };
  const follow = () => {
    const W = stage.clientWidth, H = stage.clientHeight;
    const vh = W * 1296 / 720, vtop = H - vh;          // ролик прижат к низу сцены
    const [x, top] = at(video.currentTime);
    const gemH = gem.clientHeight;
    const gap = vh * 0.025;                              // зазор над макушкой
    gem.style.transform = `translate(${x * W}px, ${vtop + top * vh - gap - gemH}px)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);

  return { fillNeeds() {} };
}
