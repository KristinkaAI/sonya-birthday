// Анкета гостя → Google Apps Script → Гугл-таблица.
import { validateRsvp } from './logic.js?v=20261010180653';

export function initRsvp(url) {
  const form = document.getElementById('rsvpForm');
  const errors = document.getElementById('rsvpErrors');
  const send = document.getElementById('rsvpSend');
  const wish = document.getElementById('wish');
  const wishText = document.getElementById('wishText');
  document.getElementById('wishClose').addEventListener('click', () => { wish.hidden = true; });

  // «Не буду пить алкоголь» снимает остальные напитки, и наоборот
  const NO_ALCOHOL = 'Не буду пить алкоголь';
  const drinkBoxes = [...form.querySelectorAll('input[name="drinks"]')];
  drinkBoxes.forEach(box => box.addEventListener('change', () => {
    if (!box.checked) return;
    drinkBoxes.forEach(other => {
      if (other !== box && (box.value === NO_ALCOHOL || other.value === NO_ALCOHOL)) other.checked = false;
    });
  }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name: form.name.value.trim(),
      attend: form.querySelector('input[name="attend"]:checked')?.value || '',
      drinks: [...form.querySelectorAll('input[name="drinks"]:checked')].map(i => i.value),
    };
    const problems = validateRsvp(data);
    errors.textContent = problems.join('. ');
    if (problems.length) return;

    if (!url) {
      errors.textContent = 'Анкета скоро заработает — попробуйте чуть позже.';
      return;
    }

    send.disabled = true;
    send.textContent = 'Отправляем…';
    try {
      // text/plain + no-cors: без предварительного CORS-запроса, Apps Script принимает тело как есть
      await fetch(url, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...data, ts: new Date().toISOString() }),
      });
      wishText.textContent = data.attend === 'yes'
        ? `${data.name.split(' ')[0]}, спасибо! Жду тебя на празднике!`
        : `${data.name.split(' ')[0]}, спасибо за ответ! Жаль, что не получится.`;
      wish.hidden = false;
      form.reset();
      errors.textContent = '';
    } catch {
      errors.textContent = 'Не получилось отправить. Проверьте интернет и нажмите «Ещё раз».';
      send.textContent = 'Ещё раз';
      send.disabled = false;
      return;
    }
    send.disabled = false;
    send.textContent = 'Отправить';
  });
}
