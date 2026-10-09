// Чистые функции без DOM — покрыты тестами в tests/logic.test.mjs.

export const pad2 = n => String(n).padStart(2, '0');

// Сколько осталось до праздника; после начала — нули и started: true.
export function countdown(nowMs, targetMs) {
  const left = Math.max(0, targetMs - nowMs);
  const s = Math.floor(left / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    started: left === 0,
  };
}

// Заполненность полосок потребностей: 0.15 за spanDays дней и раньше, 1 в день праздника.
export function needsLevel(nowMs, targetMs, spanDays = 30) {
  const left = (targetMs - nowMs) / 86400e3;
  const k = 1 - Math.min(Math.max(left / spanDays, 0), 1);
  return Math.round((0.15 + 0.85 * k) * 1000) / 1000;
}

export function validateRsvp({ name, attend }) {
  const errors = [];
  if (!name || !name.trim()) errors.push('Напишите имя и фамилию');
  if (attend !== 'yes' && attend !== 'no') errors.push('Выберите, придёте ли вы');
  return errors;
}
