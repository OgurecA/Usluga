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

  // Закрытие соединения с базой данных
  close: () => db.close(),
};

