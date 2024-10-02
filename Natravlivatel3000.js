const db = require('./Database.js');
const schedule = require('node-schedule');

// Запускаем проверку устаревших записей каждые 15 минут
schedule.scheduleJob('*/15 * * * *', () => {
  console.log('Запуск проверки устаревших заявок...');
  db.removeExpiredRequests();
});

console.log('Планировщик запущен и готов к работе.');

// Первый запуск для удаления устаревших заявок
db.removeExpiredRequests();
