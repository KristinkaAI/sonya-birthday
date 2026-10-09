// Сцена «Создание персонажа»: ролики подряд на двух <video> без мигания,
// вихрь искр и конфетти по таймингам из конфига.
import { burstConfetti } from './confetti.js?v=20261009180150';

function makeSwirl(host, seconds) {
  host.innerHTML = '';
  const N = 46;
  for (let i = 0; i < N; i++) {
    const s = document.createElement('i');
    s.style.setProperty('--dur', `${seconds * (0.7 + Math.random() * 0.3)}s`);
    s.style.setProperty('--delay', `${Math.random() * seconds * 0.35}s`);
    s.style.setProperty('--h', `${-(260 + Math.random() * 380)}px`);
    s.style.setProperty('--r', `${60 + Math.random() * 40}px`);
    s.style.setProperty('--a', `${Math.random() * 360}deg`);
    s.style.setProperty('--s', `${6 + Math.random() * 9}px`);
    host.appendChild(s);
  }
  setTimeout(() => { host.innerHTML = ''; }, seconds * 1000 + 600);
}

export function playScene({ clips, blobs, music, onDone }) {
  const videos = [document.getElementById('casVideoA'), document.getElementById('casVideoB')];
  const plumbob = document.getElementById('casPlumbob');
  const swirlHost = document.getElementById('casSwirl');
  const canvas = document.getElementById('casConfetti');
  const src = c => blobs[c.src] || c.src;

  let idx = 0;
  const prepare = (video, clip) => {
    video.muted = !clip.voice;
    video.src = src(clip);
    if (clip.poster) video.poster = clip.poster;
    video.load();
  };

  const watch = (video, clip) => {
    let swirlDone = false, confettiDone = false;
    const tick = () => {
      if (video.paused && video.ended) return;
      const t = video.currentTime;
      if (clip.swirl && !swirlDone && t >= clip.swirl[0]) {
        swirlDone = true;
        makeSwirl(swirlHost, clip.swirl[1] - clip.swirl[0]);
      }
      if (clip.confettiAt != null && !confettiDone && t >= clip.confettiAt) {
        confettiDone = true;
        burstConfetti(canvas);
        music.pop?.();
      }
      if (!video.ended) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const playAt = k => {
    const clip = clips[k];
    const cur = videos[k % 2];
    const next = videos[(k + 1) % 2];
    music.duck(Boolean(clip.voice));
    const p = cur.play();
    if (p) p.catch(() => { cur.muted = true; cur.play().catch(() => {}); });
    const show = () => { cur.classList.add('on'); next.classList.remove('on'); };
    if (cur.readyState >= 2) show(); else cur.addEventListener('playing', show, { once: true });
    watch(cur, clip);
    if (clips[k + 1]) prepare(next, clips[k + 1]);
    cur.onended = () => {
      if (clips[k + 1]) playAt(k + 1);
      else { music.duck(false); onDone?.(); }
    };
  };

  // Браузер может сам приостановить ролик (энергосбережение, свёрнутая вкладка) —
  // продолжаем, как только страница снова видна.
  let finished = false;
  const resume = () => {
    if (finished || document.hidden) return;
    const v = videos.find(x => x.classList.contains('on'));
    if (v && v.paused && !v.ended) v.play().catch(() => {});
  };
  videos.forEach(v => v.addEventListener('pause', () => setTimeout(resume, 300)));
  document.addEventListener('visibilitychange', resume);
  setInterval(resume, 1500);
  const done = onDone;
  onDone = () => { finished = true; done?.(); };

  // первый ролик готовим и запускаем сразу (вызывается внутри жеста пользователя)
  prepare(videos[0], clips[0]);
  plumbob.classList.add('on');
  playAt(idx);
}
