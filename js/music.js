// Фоновая музыка через Web Audio.
// Почему не <audio>: на iPhone одновременно звучит только один медиа-элемент страницы,
// и ролик с голосом выключал музыку. Web Audio звучит вместе с видео.
// — Пытаемся включить сразу; если браузер не разрешает звук без касания —
//   включаем при первом касании (touchend / click / keydown).
// — Тихая громкость и плавное нарастание встроены в файл; по кругу играем без
//   повторного нарастания (loopStart = конец вступления).
// — Нотка: выключить / включить; при включении трек начинается сначала.
const FADE_END = 3;

export function initMusic(src) {
  const button = document.getElementById('music');
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) { button.hidden = true; return { start() {}, duck() {} }; }

  // iOS 17+: играть и в беззвучном режиме, вместе с видео
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}

  const ctx = new AC();
  let buffer = null;
  let source = null;
  let wantOn = true;
  let resumedAt = 0; // когда звук только что разрешили — касание не считаем выключением

  const paint = () => {
    button.classList.toggle('off', !wantOn);
    button.classList.toggle('playing', wantOn && Boolean(source) && ctx.state === 'running');
  };

  const begin = () => {
    if (!wantOn || !buffer || source || ctx.state !== 'running') { paint(); return; }
    source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = FADE_END;
    source.loopEnd = buffer.duration;
    source.connect(ctx.destination);
    source.start(0, 0);
    paint();
  };

  const stop = () => {
    if (source) { try { source.stop(); } catch {} source.disconnect(); source = null; }
    paint();
  };

  fetch(src)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
    .then(data => new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail)))
    .then(b => { buffer = b; begin(); })
    .catch(() => { button.hidden = true; });

  ctx.onstatechange = () => {
    if (ctx.state === 'running') { resumedAt = performance.now(); begin(); } else paint();
  };

  // Вызывать внутри жеста пользователя
  const unlock = () => {
    if (ctx.state !== 'running') ctx.resume().then(begin).catch(() => {});
    else begin();
  };
  ['touchend', 'click', 'keydown'].forEach(e =>
    window.addEventListener(e, unlock, { capture: true, passive: true }));

  button.addEventListener('click', e => {
    e.stopPropagation();
    if (ctx.state !== 'running' || performance.now() - resumedAt < 800) { wantOn = true; unlock(); return; }
    if (wantOn && source) { wantOn = false; stop(); }
    else { wantOn = true; stop(); begin(); }
  });
  paint();

  return { start: unlock, duck() {} };
}
