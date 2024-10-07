const redis = require('redis');

// Создаем подключение к Redis
const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
});

// Обработка ошибок подключения
redisClient.on('error', (err) => {
  console.error('Ошибка подключения к Redis:', err);
});

module.exports = redisClient;
