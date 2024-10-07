const { createClient } = require('redis');

// Создаем новый клиент Redis
const redisClient = createClient();

redisClient.on('error', (err) => {
  console.error('Ошибка подключения к Redis:', err);
});

// Подключаемся к Redis
(async () => {
  await redisClient.connect();
  console.log('Успешное подключение к Redis');
})();

module.exports = redisClient;
