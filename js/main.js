import { CONFIG } from './config.js?v=20261009173126';
import { startLoader } from './loader.js?v=20261009173126';
import { initMusic } from './music.js?v=20261009173126';
import { playScene } from './scene.js?v=20261009173126';
import { initRsvp } from './rsvp.js?v=20261009173126';
import { initFinal } from './final.js?v=20261009173126';
import { buildPlumbobs } from './plumbob.js?v=20261009173126';

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
}, { threshold: 0.2 });
document.querySelectorAll('.reveal').forEach(s => io.observe(s));

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
