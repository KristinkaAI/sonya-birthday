// Экран загрузки: предзагружает медиа с прогрессом, крутит шуточные фразы,
// по нажатию «Открыть» синхронно вызывает onOpen (это жест пользователя — можно включать звук).

async function fetchWithProgress(url, onBytes) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body || !total) {
    const blob = await res.blob();
    onBytes(blob.size, blob.size);
    return blob;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onBytes(value.length, 0);
  }
  return new Blob(chunks, { type: res.headers.get('content-type') || '' });
}

export function startLoader({ urls, phrases, onOpen }) {
  const el = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');
  const phrase = document.getElementById('loaderPhrase');
  const button = document.getElementById('loaderOpen');
  document.body.classList.add('locked');

  let i = 0;
  phrase.textContent = phrases[0];
  const timer = setInterval(() => { i = (i + 1) % phrases.length; phrase.textContent = phrases[i]; }, 1300);

  // Прогресс: доля загруженных файлов + байты текущих (без точного total — по файлам)
  let done = 0;
  const parts = new Array(urls.length).fill(0);
  const sizes = new Array(urls.length).fill(0);
  const paint = () => {
    const byFiles = done / urls.length;
    const partial = parts.reduce((s, p, k) => s + (sizes[k] ? 0 : Math.min(p / 1.5e6, 0.95)), 0) / urls.length;
    fill.style.width = `${Math.min(100, (byFiles + partial) * 100)}%`;
  };

  const blobs = {};
  const jobs = urls.map((url, k) =>
    fetchWithProgress(url, (n, full) => { parts[k] += n; if (full) sizes[k] = full; paint(); })
      .then(blob => { blobs[url] = URL.createObjectURL(blob); })
      .catch(() => { blobs[url] = url; }) // не загрузилось заранее — браузер подгрузит сам
      .finally(() => { done += 1; sizes[k] = 1; paint(); }));

  return Promise.all(jobs).then(() => {
    clearInterval(timer);
    phrase.textContent = 'Всё готово!';
    fill.style.width = '100%';
    button.hidden = false;
    return new Promise(resolve => {
      button.addEventListener('click', () => {
        onOpen(blobs); // синхронно, внутри жеста
        el.classList.add('hide');
        document.body.classList.remove('locked');
        setTimeout(() => el.remove(), 700);
        resolve(blobs);
      }, { once: true });
    });
  });
}
