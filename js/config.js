// Всё, что может поменяться, — здесь.
export const CONFIG = {
  // Начало праздника по красноярскому времени (UTC+7)
  partyISO: '2026-11-04T17:00:00+07:00',
  dateText: '4 ноября',
  timeText: '17:00',
  age: 29,

  placeName: 'База отдыха Black Pine',
  placeAddress: 'пос. Манский, ул. Вторая Лесная, 28/1',
  mapUrl: 'https://2gis.ru/krasnoyarsk/geo/70000001075773322',

  // Ссылка на веб-приложение Google Apps Script (см. apps-script/ИНСТРУКЦИЯ.md)
  rsvpUrl: 'https://script.google.com/macros/s/AKfycbxZLbr1xHC1ItNSDo7JsgJxA5TXAEl3gmcMpOHgr7KnYFaaHcOTCd-RCWQtjJibiDW8/exec',

  // Музыка: тихая версия с нарастанием, делается tools/soft_music.swift
  musicSrc: 'media/music.m4a',

  // Ролики сцены «Создание персонажа» — идут подряд.
  // swirl: [от, до] — секунды, когда сайт добавляет вихрь искр;
  // confettiAt — секунда, когда сайт запускает конфетти;
  // voice: true — в ролике есть голос, музыку на это время приглушаем.
  clips: [
    // один склеенный ролик (tools/join_scene.swift): переодевание → торт → свечи
    { src: 'media/scene.mp4', poster: 'media/poster-a.jpg', voice: true, swirl: [2.7, 4.5], confettiAt: 10.0 },
  ],
  finalClip: { src: 'media/d-final.mp4', poster: 'media/poster-d.jpg' },

  preload: ['media/scene.mp4', 'media/d-final.mp4', 'media/cover.webp', 'media/date-cake.webp'],

  loadingPhrases: [
    'Взбиваем крем для торта…',
    'Надуваем шарики…',
    'Ретикулируем сплайны…',
    'Подбираем платье…',
    'Зажигаем свечи…',
    'Наполняем бокалы…',
    'Повышаем настроение до максимума…',
  ],
};
