// Объёмный кристалл: шестигранная бипирамида из 12 граней (CSS 3D).
// Разметка: <div class="pb3d pb3d--green"></div> — грани добавляются здесь.
const SIDES = 6;

export function buildPlumbobs(root = document) {
  root.querySelectorAll('.pb3d:not([data-built])').forEach(el => {
    el.dataset.built = '1';
    const spin = document.createElement('div');
    spin.className = 'pb3d__spin';
    for (let k = 0; k < SIDES; k++) {
      for (const half of ['top', 'bot']) {
        const f = document.createElement('i');
        f.className = `pb3d__f pb3d__f--${half} pb3d__f--${k % 2 ? 'b' : 'a'}`;
        f.style.setProperty('--k', k);
        spin.appendChild(f);
      }
    }
    el.appendChild(spin);
  });
}
