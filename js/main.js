import { CONFIG } from './config.js?v=20261010182111';
import { startLoader } from './loader.js?v=20261010182111';
import { initMusic } from './music.js?v=20261010182111';
import { playScene } from './scene.js?v=20261010182111';
import { initRsvp } from './rsvp.js?v=20261010182111';
import { initFinal } from './final.js?v=20261010182111';
import { buildPlumbobs } from './plumbob.js?v=20261010182111';

const $ = id => document.getElementById(id);

buildPlumbobs();

// Тексты из конфига
$('coverAge').textContent = CONFIG.age;
$('dateText').textContent = CONFIG.dateText;
$('timeText').textContent = CONFIG.timeText;
$('placeName').textContent = CONFIG.placeName;
$('placeAddr').textContent = CONFIG.placeAddress;
$('mapLink').href = CONFIG.mapUrl;
$('mapButton').href = CONFIG.mapUrl;

const music = initMusic(CONFIG.musicSrc);
const final = initFinal(CONFIG.partyISO);
initRsvp(CONFIG.rsvpUrl);

// Появление секций при прокрутке
const finalVideo = $('finalVideo');
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    if (e.target.id === 'final') {
      final.fillNeeds();
      finalVideo.play().catch(() => {});
    }
  }
}, { threshold: 0.12, rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('.reveal').forEach(s => io.observe(s));

// Финальная сцена плавно растёт по мере прокрутки: в самом низу — полный размер,
// при прокрутке вверх снова уменьшается. Привязано к положению, без рывков.
const finalSection = $('final');
const finalStage = finalSection.querySelector('.stage--final');
let growQueued = false;
const updateGrow = () => {
  growQueued = false;
  const r = finalSection.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight - r.top) / r.height));
  finalStage.style.setProperty('--grow', (0.84 + 0.16 * p).toFixed(4));
};
const queueGrow = () => { if (!growQueued) { growQueued = true; requestAnimationFrame(updateGrow); } };
addEventListener('scroll', queueGrow, { passive: true });
addEventListener('resize', queueGrow);
updateGrow();

startLoader({
  urls: CONFIG.preload,
  phrases: CONFIG.loadingPhrases,
  onOpen(blobs) {
    music.start();
    finalVideo.src = blobs[CONFIG.finalClip.src] || CONFIG.finalClip.src;
    finalVideo.poster = CONFIG.finalClip.poster;
    playScene({
      clips: CONFIG.clips,
      blobs,
      music,
      onDone: () => {
        $('casStage').classList.add('done');
        $('casCover').classList.add('on');
        $('scrollHint').classList.add('on');
      },
    });
  },
});
