import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countdown, needsLevel, validateRsvp, pad2 } from '../js/logic.js';

const T = Date.parse('2026-11-04T17:00:00+07:00');
const H = 3600e3, D = 24 * H;

test('countdown splits remaining time', () => {
  assert.deepEqual(countdown(T - (4 * D + 8 * H + 14 * 60e3 + 56e3), T),
    { days: 4, hours: 8, minutes: 14, seconds: 56, started: false });
});

test('countdown after start', () => {
  assert.deepEqual(countdown(T + 1000, T),
    { days: 0, hours: 0, minutes: 0, seconds: 0, started: true });
});

test('needsLevel grows toward party', () => {
  assert.equal(needsLevel(T - 60 * D, T), 0.15);
  assert.equal(needsLevel(T, T), 1);
  const mid = needsLevel(T - 15 * D, T);
  assert.ok(mid > 0.5 && mid < 0.65);
});

test('validateRsvp', () => {
  assert.deepEqual(validateRsvp({ name: '  ', attend: '', drinks: [] }),
    ['Напишите имя и фамилию', 'Выберите, придёте ли вы']);
  assert.deepEqual(validateRsvp({ name: 'Аня', attend: 'yes', drinks: [] }), []);
});

test('pad2', () => {
  assert.equal(pad2(4), '04');
  assert.equal(pad2(14), '14');
});
