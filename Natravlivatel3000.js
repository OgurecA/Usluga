const db = require('./Database.js'); // Подключение к базе данных
const schedule = require('node-schedule');

// Функция для удаления устаревших заявок
function removeExpiredRequests() {
  const currentDateTime = new Date();
  const formattedCurrentDate = `${currentDateTime.getFullYear()}-${(currentDateTime.getMonth() + 1).toString().padStart(2, '0')}-${currentDateTime.getDate().toString().padStart(2, '0')} ${currentDateTime.getHours().toString().padStart(2, '0')}:${currentDateTime.getMinutes().toString().padStart(2, '0')}`;

  console.log(`Проверка на удаление устаревших заявок: ${formattedCurrentDate}`);

  // Удаление устаревших записей из таблицы `search`
  const deleteSearch = db.prepare(`DELETE FROM search WHERE deletion <= ?`);
  deleteSearch.run(formattedCurrentDate);

  // Удаление устаревших записей из таблицы `offer`
  const deleteOffer = db.prepare(`DELETE FROM offer WHERE deletion <= ?`);
  deleteOffer.run(formattedCurrentDate);

  console.log('Удаление устаревших заявок завершено.');
}

// Планируем выполнение функции каждые 15 минут
schedule.scheduleJob('*/15 * * * *', removeExpiredRequests);

// Запуск функции при старте
removeExpiredRequests();
