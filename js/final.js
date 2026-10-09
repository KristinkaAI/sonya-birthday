// Финал: обратный отсчёт и полоски потребностей.
import { countdown, needsLevel, pad2 } from './logic.js';

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

  const level = needsLevel(Date.now(), target);
  // полоски заполняются, когда финал появляется на экране
  const fillNeeds = () => document.querySelectorAll('[data-need]').forEach(b => {
    b.style.width = `${Math.round(level * Number(b.dataset.need) * 100)}%`;
  });
  return { fillNeeds };
}
