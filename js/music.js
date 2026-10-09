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

  // Звук хлопушки (синтез, без чужих файлов): хлопок + низкий «бум» + шелест конфетти,
  // две хлопушки — слева и справа.
  const noise = seconds => {
    const b = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };
  const popAt = (when, pan) => {
    const out = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (out.pan) out.pan.value = pan;
    out.connect(ctx.destination);
    // хлопок
    const n = ctx.createBufferSource(); n.buffer = noise(0.3);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = 0.8;
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.0001, when);
    g1.gain.exponentialRampToValueAtTime(1.0, when + 0.004);
    g1.gain.exponentialRampToValueAtTime(0.001, when + 0.16);
    n.connect(bp).connect(g1).connect(out); n.start(when); n.stop(when + 0.3);
    // низкий «бум»
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(170, when); o.frequency.exponentialRampToValueAtTime(45, when + 0.12);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.7, when); g2.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
    o.connect(g2).connect(out); o.start(when); o.stop(when + 0.2);
    // шелест падающего конфетти
    const r = ctx.createBufferSource(); r.buffer = noise(1.4);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5500;
    const g3 = ctx.createGain();
    g3.gain.setValueAtTime(0.0001, when + 0.03);
    g3.gain.exponentialRampToValueAtTime(0.12, when + 0.12);
    g3.gain.exponentialRampToValueAtTime(0.001, when + 1.3);
    r.connect(hp).connect(g3).connect(out); r.start(when + 0.03); r.stop(when + 1.4);
  };
  const pop = () => {
    if (ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.01;
    popAt(t, -0.6);
    popAt(t + 0.05, 0.6);
  };

  return { start: unlock, duck() {}, pop };
}
