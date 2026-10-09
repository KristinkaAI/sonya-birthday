// Фоновая музыка. Телефоны не дают включить звук до первого касания,
// поэтому музыка грузится сразу, а стартует по первому касанию в любом месте
// (или по нотке). Обычный <audio>: он играет и в беззвучном режиме iPhone.
// На iPhone громкость менять нельзя — там вместо приглушения музыка ставится на паузу.
const NORMAL = 0.6, QUIET = 0.12, FADE_IN = 3000;

export function initMusic(src) {
  const button = document.getElementById('music');
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = 'auto';
  audio.addEventListener('error', () => { button.hidden = true; });

  // Можно ли менять громкость (на iOS audio.volume только для чтения)
  audio.volume = 0.5;
  const canFade = Math.abs(audio.volume - 0.5) < 0.01;
  audio.volume = 1;

  let started = false;   // музыка запущена хотя бы раз
  let startedAt = 0;
  let wantOn = true;     // пользователь не выключал нотку
  let ducked = false;
  let fadeTimer = null;

  const fadeTo = (value, ms) => {
    if (!canFade) return;
    clearInterval(fadeTimer);
    const from = audio.volume, t0 = performance.now();
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      audio.volume = from + (value - from) * k;
      if (k === 1) clearInterval(fadeTimer);
    }, 50);
  };
  const level = () => (ducked ? QUIET : NORMAL);

  const paint = () => {
    button.classList.toggle('waiting', !started && wantOn);
    button.classList.toggle('off', !wantOn);
    button.classList.toggle('playing', started && wantOn && !audio.paused);
  };

  const play = () => audio.play().catch(() => {});

  // вызывать внутри жеста пользователя
  const start = () => {
    if (started || !wantOn) return;
    started = true;
    startedAt = performance.now();
    if (canFade) audio.volume = 0;
    audio.play()
      .then(() => {
        if (ducked && !canFade) audio.pause();
        fadeTo(level(), FADE_IN);
      })
      .catch(() => { started = false; paint(); });
    paint();
  };

  ['pointerup', 'touchend', 'click', 'keydown'].forEach(e =>
    window.addEventListener(e, () => start(), { capture: true, passive: true }));

  button.addEventListener('click', e => {
    e.stopPropagation();
    // это же касание только что запустило музыку — не выключаем её
    if (performance.now() - startedAt < 800) return;
    if (!started) { wantOn = true; start(); return; }
    wantOn = !wantOn;
    if (wantOn) {
      if (!(ducked && !canFade)) play();
      fadeTo(level(), 600);
    } else {
      audio.pause();
    }
    paint();
  });
  audio.addEventListener('play', paint);
  audio.addEventListener('pause', paint);
  paint();

  return {
    start,
    duck(on) {
      ducked = on;
      if (!started || !wantOn) return;
      if (canFade) fadeTo(level(), 800);
      else if (on) audio.pause();
      else play();
    },
  };
}
