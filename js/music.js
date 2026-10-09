// Фоновая музыка и кнопка-нотка. Если файла нет — кнопка не показывается.
const NORMAL = 0.6, QUIET = 0.12;

export function initMusic(src) {
  const button = document.getElementById('music');
  const audio = new Audio();
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = NORMAL;
  let available = false;
  let wantOn = true;
  let fadeTimer = null;

  const fadeTo = target => {
    clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {
      const d = target - audio.volume;
      if (Math.abs(d) < 0.03) { audio.volume = target; clearInterval(fadeTimer); return; }
      audio.volume += d * 0.25;
    }, 50);
  };

  const ready = fetch(src, { method: 'HEAD' })
    .then(r => { available = r.ok; })
    .catch(() => { available = false; })
    .then(() => {
      if (!available) return;
      audio.src = src;
      button.hidden = false;
    });

  const paint = () => {
    button.classList.toggle('off', !wantOn);
    button.classList.toggle('playing', wantOn && !audio.paused);
  };

  button.addEventListener('click', () => {
    wantOn = !wantOn;
    if (wantOn) audio.play().catch(() => {}); else audio.pause();
    paint();
  });
  audio.addEventListener('play', paint);
  audio.addEventListener('pause', paint);

  return {
    // вызывать внутри жеста пользователя
    start() {
      if (available && wantOn) audio.play().catch(() => {});
      else ready.then(() => { if (available && wantOn) audio.play().catch(() => {}); });
    },
    duck(on) { if (available) fadeTo(on ? QUIET : NORMAL); },
  };
}
