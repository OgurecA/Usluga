// database.js
const Database = require('better-sqlite3');
const path = require('path');

// Подключение базы данных (создает файл bot_database.sqlite, если его еще нет)
const db = new Database(path.join(__dirname, 'bot_database.sqlite'));

// Создание таблицы "search" для хранения заявок на поиск услуг
db.prepare(`
CREATE TABLE IF NOT EXISTS search (
  id INTEGER,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  amount TEXT NOT NULL,
  description TEXT NOT NULL,
  contact TEXT NOT NULL,
  deletion TEXT NOT NULL
)`).run();

// Создание таблицы "offer" для хранения предложений услуг
db.prepare(`
CREATE TABLE IF NOT EXISTS offer (
  id INTEGER,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  amount TEXT NOT NULL,
  description TEXT NOT NULL,
  contact TEXT NOT NULL,
  deletion TEXT NOT NULL
)`).run();

// Функция для удаления устаревших записей
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

// Функции работы с базой данных
module.exports = {
  // Пример функции для добавления заявки в таблицу search
  addSearchRequest: (id, country, city, date, time, amount, description, contact, deletion) => {
    const insert = db.prepare(`
      INSERT INTO search (id, country, city, date, time, amount, description, contact, deletion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, country, city, date, time, amount, description, contact, deletion);
  },

  // Пример функции для добавления заявки в таблицу offer
  addOfferRequest: (id, country, city, date, time, amount, description, contact, deletion) => {
    const insert = db.prepare(`
      INSERT INTO offer (id, country, city, date, time, amount, description, contact, deletion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, country, city, date, time, amount, description, contact, deletion);
  },

  getSearchRequestsByUser: (id) => {
    const select = db.prepare(`
      SELECT * FROM search WHERE id = ?
    `);
    return select.all(id);
  },

  getOfferRequestsByUser: (id) => {
    const select = db.prepare(`
      SELECT * FROM offer WHERE id = ?
    `);
    return select.all(id);
  },

  getOffersByCountry: (country) => {
    const query = db.prepare("SELECT * FROM offer WHERE country = ?");
    return query.all(country);
  },

  getSearchesByCountry: (country) => {
    const query = db.prepare("SELECT * FROM search WHERE country = ?");
    return query.all(country);
  },

  removeExpiredRequests: removeExpiredRequests,

  // Закрытие соединения с базой данных
  close: () => db.close(),
};
