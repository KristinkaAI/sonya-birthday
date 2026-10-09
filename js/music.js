// Фоновая музыка.
// — Пытаемся включить сразу при загрузке; если браузер запрещает звук без касания
//   (телефоны), музыка стартует от первого касания в любом месте.
// — Громкость и плавное нарастание встроены в сам файл (на iPhone сайт не может менять громкость).
// — Голос в роликах звучит поверх музыки, музыку не приглушаем.
// — Нотка: выключить / включить; при включении трек начинается сначала.
// — По кругу: после конца трека продолжаем с конца вступления, без повторного нарастания.
const FADE_END = 3; // секунд нарастания, встроенных в файл

export function initMusic(src) {
  const button = document.getElementById('music');
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.addEventListener('error', () => { button.hidden = true; });

  let wantOn = true;     // пользователь не выключал нотку
  let playing = false;
  let startedAt = 0;

  const paint = () => {
    button.classList.toggle('waiting', wantOn && !playing);
    button.classList.toggle('off', !wantOn);
    button.classList.toggle('playing', wantOn && playing);
  };
  audio.addEventListener('playing', () => { playing = true; paint(); });
  audio.addEventListener('pause', () => { playing = false; paint(); });
  audio.addEventListener('ended', () => {
    if (!wantOn) return;
    audio.currentTime = FADE_END;
    audio.play().catch(() => {});
  });

  const play = fromStart => {
    if (fromStart) audio.currentTime = 0;
    startedAt = performance.now();
    return audio.play();
  };

  // 1. Пробуем без касания
  play(true).catch(() => {});

  // 2. Первое касание в любом месте
  const onGesture = () => {
    if (wantOn && !playing && audio.paused) play(audio.currentTime > 0.5 ? false : true).catch(() => {});
  };
  ['pointerup', 'touchend', 'click', 'keydown'].forEach(e =>
    window.addEventListener(e, onGesture, { capture: true, passive: true }));

  // 3. Нотка
  button.addEventListener('click', e => {
    e.stopPropagation();
    if (performance.now() - startedAt < 800) return; // это же касание только что включило музыку
    if (wantOn && !audio.paused) {
      wantOn = false;
      audio.pause();
    } else {
      wantOn = true;
      play(true).catch(() => {});
    }
    paint();
  });
  paint();

  return {
    start: onGesture,
    duck() {}, // голос и музыка звучат вместе
  };
}
