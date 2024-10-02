// Тестовый скрипт для проверки работы функций
const db = require('./Database.js');


// Пример получения всех заявок пользователя
const requests = db.getSearchRequestsByUser(1);
console.log('Заявки пользователя:', requests);

// Пример получения всех предложений по стране
const offers = db.getOffersByCountry('Russia');
console.log('Предложения по России:', offers);
