const db = require('./Database.js');
const schedule = require('node-schedule');

// Функция для удаления устаревших заявок
function removeExpiredRequests() {
  const currentDateTime = new Date();
  const formattedCurrentDate = `${currentDateTime.getFullYear()}-${(currentDateTime.getMonth() + 1).toString().padStart(2, '0')}-${currentDateTime.getDate().toString().padStart(2, '0')} ${currentDateTime.getHours().toString().padStart(2, '0')}:${currentDateTime.getMinutes().toString().padStart(2, '0')}`;

  console.log(`Проверка на удаление устаревших заявок: ${formattedCurrentDate}`);

  // Удаление устаревших записей из таблицы `search`
  const deleteSearch = db.prepare(`DELETE FROM search WHERE deletion <= ?`);
  const changesSearch = deleteSearch.run(formattedCurrentDate);
  console.log(`Удалено ${changesSearch.changes} устаревших записей из таблицы search.`);

  // Удаление устаревших записей из таблицы `offer`
  const deleteOffer = db.prepare(`DELETE FROM offer WHERE deletion <= ?`);
  const changesOffer = deleteOffer.run(formattedCurrentDate);
  console.log(`Удалено ${changesOffer.changes} устаревших записей из таблицы offer.`);
}

// Запускаем функцию проверки каждые 15 минут
schedule.scheduleJob('*/15 * * * *', () => {
  console.log('Запуск проверки устаревших заявок...');
  removeExpiredRequests();
});

console.log('Планировщик запущен и готов к работе.');
