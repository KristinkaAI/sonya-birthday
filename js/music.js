// Фоновая музыка. Телефоны не дают включить звук до первого касания,
// поэтому музыка грузится сразу, а стартует по первому касанию в любом месте
// (или по нотке) — с плавным нарастанием. Громкость управляется через Web Audio:
// на iPhone свойство audio.volume не работает.
const NORMAL = 0.6, QUIET = 0.12, FADE_IN = 3;

export function initMusic(src) {
  const button = document.getElementById('music');
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = 'auto';

  let ctx = null, gain = null;
  let started = false;   // музыка запущена хотя бы раз
  let wantOn = true;     // пользователь не выключал нотку
  let ducked = false;

  audio.addEventListener('error', () => { button.hidden = true; });

  const target = () => (ducked ? QUIET : NORMAL);
  const ramp = (value, seconds) => {
    if (!gain) { audio.volume = value; return; }
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(value, t + seconds);
  };

  const paint = () => {
    button.classList.toggle('waiting', !started && wantOn);
    button.classList.toggle('off', !wantOn);
    button.classList.toggle('playing', started && wantOn && !audio.paused);
  };

  // вызывать только внутри жеста пользователя
  const start = () => {
    if (started || !wantOn) return;
    started = true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        ctx = new AC();
        gain = ctx.createGain();
        gain.gain.value = 0;
        ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
        ctx.resume();
      }
    } catch { ctx = null; gain = null; }
    if (!gain) audio.volume = 0.05;
    audio.play().then(() => ramp(target(), FADE_IN)).catch(() => { started = false; paint(); });
    paint();
  };

  // Первое касание в любом месте страницы
  const onFirstGesture = () => start();
  ['pointerup', 'touchend', 'keydown'].forEach(e =>
    window.addEventListener(e, onFirstGesture, { capture: true, passive: true }));

  button.addEventListener('click', e => {
    e.stopPropagation();
    if (!started) { wantOn = true; start(); return; }
    wantOn = !wantOn;
    if (wantOn) { ctx?.resume(); audio.play().catch(() => {}); ramp(target(), 0.6); }
    else audio.pause();
    paint();
  });
  audio.addEventListener('play', paint);
  audio.addEventListener('pause', paint);
  paint();

  return {
    start,
    duck(on) { ducked = on; if (started && wantOn) ramp(target(), 0.8); },
  };
}
