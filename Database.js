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
  keywords TEXT NOT NULL,
  description TEXT NOT NULL,
  contact TEXT NOT NULL,
  deletion TEXT NOT NULL,
  creation_date TEXT NOT NULL
)`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS search_logs (
    id INTEGER,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    amount TEXT NOT NULL,
    keywords TEXT NOT NULL,
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
  keywords TEXT NOT NULL,
  description TEXT NOT NULL,
  contact TEXT NOT NULL,
  creation_date TEXT NOT NULL
)`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS offer_logs (
    id INTEGER,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    amount TEXT NOT NULL,
    keywords TEXT NOT NULL,
    description TEXT NOT NULL,
    contact TEXT NOT NULL
  )`).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      date TEXT NOT NULL,
      verified BOOLEAN DEFAULT 0
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

const deleteSearchRequest = (userId, country, city, date, time, amount, description) => {
  const query = `
    DELETE FROM search 
    WHERE id = ? AND country = ? AND city = ? AND date = ? AND time = ? AND amount = ? AND description = ?
  `;
  const statement = db.prepare(query);
  statement.run(userId, country, city, date, time, amount, description);
};

// Функция удаления заявки на предоставление услуг по параметрам
const deleteOfferRequest = (userId, country, city, date, time, amount, description) => {
  const query = `
    DELETE FROM offer 
    WHERE id = ? AND country = ? AND city = ? AND date = ? AND time = ? AND amount = ? AND description = ?
  `;
  const statement = db.prepare(query);
  statement.run(userId, country, city, date, time, amount, description);
};

// Функции работы с базой данных
module.exports = {
  // Пример функции для добавления заявки в таблицу search
  addSearchRequest: (id, country, city, date, time, amount, keywords, description, contact, deletion, creation_date) => {
    const insert = db.prepare(`
      INSERT INTO search (id, country, city, date, time, amount, keywords, description, contact, deletion, creation_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, country, city, date, time, amount, keywords, description, contact, deletion, creation_date);
  },
  addSearchRequestLogs: (id, country, city, date, time, amount, keywords, description, contact) => {
    const insert = db.prepare(`
      INSERT INTO search_logs (id, country, city, date, time, amount, keywords, description, contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, country, city, date, time, amount, keywords, description, contact);
  },

  // Пример функции для добавления заявки в таблицу offer
  addOfferRequest: (id, country, city, date, time, amount, keywords, description, contact, deletion, creation_date) => {
    const insert = db.prepare(`
      INSERT INTO offer (id, country, city, date, time, amount, keywords, description, contact, deletion, creation_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, country, city, date, time, amount, keywords, description, contact, deletion, creation_date);
  },
  addOfferRequestLogs: (id, country, city, date, time, amount, keywords, description, contact) => {
    const insert = db.prepare(`
      INSERT INTO offer_logs (id, country, city, date, time, amount, keywords, description, contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(id, country, city, date, time, amount, keywords, description, contact);
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

  getOffersByCity: (country, city) => {
    const query = db.prepare("SELECT * FROM offer WHERE country = ? AND (city = ? OR city = 'Любой город')");
    return query.all(country, city);
  },
  
  getSearchesByCity: (country, city) => {
    const query = db.prepare("SELECT * FROM search WHERE country = ? AND (city = ? OR city = 'Любой город')");
    return query.all(country, city);
  },

  addUser: (id, date) => {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO users (id, date)
      VALUES (?, ?)
    `);
    insert.run(id, date);
  },
  getUserDate: (id) => {
    const query = db.prepare("SELECT date FROM users WHERE id = ?");
    return query.get(id);
  },

  removeExpiredRequests: removeExpiredRequests,

  deleteSearchRequest,
  
  deleteOfferRequest,

  // Закрытие соединения с базой данных
  close: () => db.close(),
};
