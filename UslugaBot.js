// Импорт библиотек
const TelegramBot = require('node-telegram-bot-api');
const natural = require('natural');
const db = require('./Database.js');
const redisClient = require('./redisClient');
const cities = require('all-the-cities');
const moment = require('moment-timezone');

// Настройка токена и создание экземпляра бота
const token = '8083887592:AAGT_8XTHSgSPwbjc7hC8kRLner6v9ZJx2E';
const bot = new TelegramBot(token, { polling: true });

// Глобальное хранилище состояний пользователей
const states = {};

const countries = [
  // Английский — Русский
  'Afghanistan', 'Афганистан',
  'Albania', 'Албания',
  'Algeria', 'Алжир',
  'Andorra', 'Андорра',
  'Angola', 'Ангола',
  'Antigua and Barbuda', 'Антигуа и Барбуда',
  'Argentina', 'Аргентина',
  'Armenia', 'Армения',
  'Australia', 'Австралия',
  'Austria', 'Австрия',
  'Azerbaijan', 'Азербайджан',
  'Bahamas', 'Багамы',
  'Bahrain', 'Бахрейн',
  'Bangladesh', 'Бангладеш',
  'Barbados', 'Барбадос',
  'Belarus', 'Беларусь',
  'Belgium', 'Бельгия',
  'Belize', 'Белиз',
  'Benin', 'Бенин',
  'Bhutan', 'Бутан',
  'Bolivia', 'Боливия',
  'Bosnia and Herzegovina', 'Босния и Герцеговина',
  'Botswana', 'Ботсвана',
  'Brazil', 'Бразилия',
  'Brunei', 'Бруней',
  'Bulgaria', 'Болгария',
  'Burkina Faso', 'Буркина-Фасо',
  'Burundi', 'Бурунди',
  'Cabo Verde', 'Кабо-Верде',
  'Cambodia', 'Камбоджа',
  'Cameroon', 'Камерун',
  'Canada', 'Канада',
  'Central African Republic', 'Центральноафриканская Республика',
  'Chad', 'Чад',
  'Chile', 'Чили',
  'China', 'Китай',
  'Colombia', 'Колумбия',
  'Comoros', 'Коморы',
  'Congo', 'Конго',
  'Costa Rica', 'Коста-Рика',
  'Croatia', 'Хорватия',
  'Cuba', 'Куба',
  'Cyprus', 'Кипр',
  'Czech Republic', 'Чехия',
  'Denmark', 'Дания',
  'Djibouti', 'Джибути',
  'Dominica', 'Доминика',
  'Dominican Republic', 'Доминиканская Республика',
  'East Timor', 'Восточный Тимор',
  'Ecuador', 'Эквадор',
  'Egypt', 'Египет',
  'El Salvador', 'Сальвадор',
  'Equatorial Guinea', 'Экваториальная Гвинея',
  'Eritrea', 'Эритрея',
  'Estonia', 'Эстония',
  'Eswatini', 'Эсватини',
  'Ethiopia', 'Эфиопия',
  'Fiji', 'Фиджи',
  'Finland', 'Финляндия',
  'France', 'Франция',
  'Gabon', 'Габон',
  'Gambia', 'Гамбия',
  'Georgia', 'Грузия',
  'Germany', 'Германия',
  'Ghana', 'Гана',
  'Greece', 'Греция',
  'Grenada', 'Гренада',
  'Guatemala', 'Гватемала',
  'Guinea', 'Гвинея',
  'Guinea-Bissau', 'Гвинея-Бисау',
  'Guyana', 'Гайана',
  'Haiti', 'Гаити',
  'Honduras', 'Гондурас',
  'Hungary', 'Венгрия',
  'Iceland', 'Исландия',
  'India', 'Индия',
  'Indonesia', 'Индонезия',
  'Iran', 'Иран',
  'Iraq', 'Ирак',
  'Ireland', 'Ирландия',
  'Israel', 'Израиль',
  'Italy', 'Италия',
  'Ivory Coast', 'Кот-д’Ивуар',
  'Jamaica', 'Ямайка',
  'Japan', 'Япония',
  'Jordan', 'Иордания',
  'Kazakhstan', 'Казахстан',
  'Kenya', 'Кения',
  'Kiribati', 'Кирибати',
  'Kosovo', 'Косово',
  'Kuwait', 'Кувейт',
  'Kyrgyzstan', 'Киргизия',
  'Laos', 'Лаос',
  'Latvia', 'Латвия',
  'Lebanon', 'Ливан',
  'Lesotho', 'Лесото',
  'Liberia', 'Либерия',
  'Libya', 'Ливия',
  'Liechtenstein', 'Лихтенштейн',
  'Lithuania', 'Литва',
  'Luxembourg', 'Люксембург',
  'Madagascar', 'Мадагаскар',
  'Malawi', 'Малави',
  'Malaysia', 'Малайзия',
  'Maldives', 'Мальдивы',
  'Mali', 'Мали',
  'Malta', 'Мальта',
  'Marshall Islands', 'Маршалловы Острова',
  'Mauritania', 'Мавритания',
  'Mauritius', 'Маврикий',
  'Mexico', 'Мексика',
  'Micronesia', 'Микронезия',
  'Moldova', 'Молдова',
  'Monaco', 'Монако',
  'Mongolia', 'Монголия',
  'Montenegro', 'Черногория',
  'Morocco', 'Марокко',
  'Mozambique', 'Мозамбик',
  'Myanmar', 'Мьянма',
  'Namibia', 'Намибия',
  'Nauru', 'Науру',
  'Nepal', 'Непал',
  'Netherlands', 'Нидерланды',
  'New Zealand', 'Новая Зеландия',
  'Nicaragua', 'Никарагуа',
  'Niger', 'Нигер',
  'Nigeria', 'Нигерия',
  'North Macedonia', 'Северная Македония',
  'Norway', 'Норвегия',
  'Oman', 'Оман',
  'Pakistan', 'Пакистан',
  'Palau', 'Палау',
  'Panama', 'Панама',
  'Papua New Guinea', 'Папуа — Новая Гвинея',
  'Paraguay', 'Парагвай',
  'Peru', 'Перу',
  'Philippines', 'Филиппины',
  'Poland', 'Польша',
  'Portugal', 'Португалия',
  'Qatar', 'Катар',
  'Romania', 'Румыния',
  'Russia', 'Россия',
  'Rwanda', 'Руанда',
  'Saint Kitts and Nevis', 'Сент-Китс и Невис',
  'Saint Lucia', 'Сент-Люсия',
  'Saint Vincent and the Grenadines', 'Сент-Винсент и Гренадины',
  'Samoa', 'Самоа',
  'San Marino', 'Сан-Марино',
  'Sao Tome and Principe', 'Сан-Томе и Принсипи',
  'Saudi Arabia', 'Саудовская Аравия',
  'Senegal', 'Сенегал',
  'Serbia', 'Сербия',
  'Seychelles', 'Сейшелы',
  'Sierra Leone', 'Сьерра-Леоне',
  'Singapore', 'Сингапур',
  'Slovakia', 'Словакия',
  'Slovenia', 'Словения',
  'Solomon Islands', 'Соломоновы Острова',
  'Somalia', 'Сомали',
  'South Africa', 'Южная Африка',
  'South Korea', 'Южная Корея',
  'South Sudan', 'Южный Судан',
  'Spain', 'Испания',
  'Sri Lanka', 'Шри-Ланка',
  'Sudan', 'Судан',
  'Suriname', 'Суринам',
  'Sweden', 'Швеция',
  'Switzerland', 'Швейцария',
  'Syria', 'Сирия',
  'Tajikistan', 'Таджикистан',
  'Tanzania', 'Танзания',
  'Thailand', 'Таиланд',
  'Togo', 'Того',
  'Tonga', 'Тонга',
  'Trinidad and Tobago', 'Тринидад и Тобаго',
  'Tunisia', 'Тунис',
  'Turkey', 'Турция',
  'Turkmenistan', 'Туркмения',
  'Tuvalu', 'Тувалу',
  'Uganda', 'Уганда',
  'Ukraine', 'Украина',
  'United Arab Emirates', 'UAE', 'Объединенные Арабские Эмираты', 'ОАЭ',
  'United Kingdom', 'UK', 'Великобритания',
  'United States', 'USA', 'США', 'Америка', 'Пендосия',
  'Uruguay', 'Уругвай',
  'Uzbekistan', 'Узбекистан',
  'Vanuatu', 'Вануату',
  'Vatican City', 'Ватикан',
  'Venezuela', 'Венесуэла',
  'Vietnam', 'Вьетнам',
  'Yemen', 'Йемен',
  'Zambia', 'Замбия',
  'Zimbabwe', 'Зимбабве'
];

const countryMapping = {
  'Россия': 'Russia',
  'США': 'USA',
  'Пендосия': 'USA',
  'Америка': 'USA',
  'United States': 'USA',
  'Китай': 'China',
  'Индия': 'India',
  'Бразилия': 'Brazil',
  'Германия': 'Germany',
  'Франция': 'France',
  'Япония': 'Japan',
  'Великобритания': 'United Kingdom',
  'UK': 'United Kingdom',
  'Италия': 'Italy',
  'Мексика': 'Mexico',
  'Канада': 'Canada',
  'Испания': 'Spain',
  'Украина': 'Ukraine',
  'Нидерланды': 'Netherlands',
  'Турция': 'Turkey',
  'Аргентина': 'Argentina',
  'Австралия': 'Australia',
  'Австрия': 'Austria',
  'Бельгия': 'Belgium',
  'Чили': 'Chile',
  'Чехия': 'Czech Republic',
  'Дания': 'Denmark',
  'Египет': 'Egypt',
  'Финляндия': 'Finland',
  'Греция': 'Greece',
  'Венгрия': 'Hungary',
  'Исландия': 'Iceland',
  'Ирландия': 'Ireland',
  'Израиль': 'Israel',
  'Казахстан': 'Kazakhstan',
  'Кения': 'Kenya',
  'Малайзия': 'Malaysia',
  'Мальта': 'Malta',
  'Марокко': 'Morocco',
  'Непал': 'Nepal',
  'Новая Зеландия': 'New Zealand',
  'Норвегия': 'Norway',
  'Пакистан': 'Pakistan',
  'Польша': 'Poland',
  'Португалия': 'Portugal',
  'Катар': 'Qatar',
  'Румыния': 'Romania',
  'Саудовская Аравия': 'Saudi Arabia',
  'Сингапур': 'Singapore',
  'Словакия': 'Slovakia',
  'Словения': 'Slovenia',
  'Южная Африка': 'South Africa',
  'Южная Корея': 'South Korea',
  'Швеция': 'Sweden',
  'Швейцария': 'Switzerland',
  'Таиланд': 'Thailand',
  'ОАЭ': 'United Arab Emirates',
  'UAE': 'United Arab Emirates',
  'Объединенные Арабские Эмираты': 'United Arab Emirates',
  'Вьетнам': 'Vietnam',
  'Беларусь': 'Belarus',
  'Латвия': 'Latvia',
  'Литва': 'Lithuania',
  'Эстония': 'Estonia',
  'Болгария': 'Bulgaria',
  'Хорватия': 'Croatia',
  'Грузия': 'Georgia',
  'Молдова': 'Moldova',
  'Сербия': 'Serbia',
  'Армения': 'Armenia',
  'Азербайджан': 'Azerbaijan',
  'Узбекистан': 'Uzbekistan',
  'Таджикистан': 'Tajikistan',
  'Кыргызстан': 'Kyrgyzstan',
  'Туркменистан': 'Turkmenistan',
  'Албания': 'Albania',
  'Андорра': 'Andorra',
  'Босния и Герцеговина': 'Bosnia and Herzegovina',
  'Кипр': 'Cyprus',
  'Лихтенштейн': 'Liechtenstein',
  'Люксембург': 'Luxembourg',
  'Северная Македония': 'North Macedonia',
  'Монако': 'Monaco',
  'Монтенегро': 'Montenegro',
  'Сан-Марино': 'San Marino',
  'Куба': 'Cuba',
  'Доминикана': 'Dominican Republic',
  'Гаити': 'Haiti',
  'Гватемала': 'Guatemala',
  'Ямайка': 'Jamaica',
  'Панама': 'Panama',
  'Пуэрто-Рико': 'Puerto Rico',
  'Тринидад и Тобаго': 'Trinidad and Tobago',
  'Багамы': 'Bahamas',
  'Барбадос': 'Barbados',
  'Гренада': 'Grenada',
  'Сент-Китс и Невис': 'Saint Kitts and Nevis',
  'Сент-Люсия': 'Saint Lucia',
  'Сент-Винсент и Гренадины': 'Saint Vincent and the Grenadines',
  'Бангладеш': 'Bangladesh',
  'Бутан': 'Bhutan',
  'Мьянма': 'Myanmar',
  'Шри-Ланка': 'Sri Lanka',
  'Мальдивы': 'Maldives',
  'Филиппины': 'Philippines',
  'Индонезия': 'Indonesia',
  'Бруней': 'Brunei',
  'Камбоджа': 'Cambodia',
  'Лаос': 'Laos',
  'Монголия': 'Mongolia',
  'Тимор-Лесте': 'Timor-Leste',
  'Ирак': 'Iraq',
  'Иран': 'Iran',
  'Иордания': 'Jordan',
  'Кувейт': 'Kuwait',
  'Ливан': 'Lebanon',
  'Сирия': 'Syria',
  'Йемен': 'Yemen',
  'Афганистан': 'Afghanistan',
  'Турция': 'Turkey'
};

const countryToISO = {
  'Afghanistan': 'af',
  'Albania': 'al',
  'Algeria': 'dz',
  'Andorra': 'ad',
  'Angola': 'ao',
  'Argentina': 'ar',
  'Armenia': 'am',
  'Australia': 'au',
  'Austria': 'at',
  'Azerbaijan': 'az',
  'Bahrain': 'bh',
  'Bangladesh': 'bd',
  'Belarus': 'by',
  'Belgium': 'be',
  'Belize': 'bz',
  'Benin': 'bj',
  'Bhutan': 'bt',
  'Bolivia': 'bo',
  'Bosnia and Herzegovina': 'ba',
  'Botswana': 'bw',
  'Brazil': 'br',
  'Brunei': 'bn',
  'Bulgaria': 'bg',
  'Burkina Faso': 'bf',
  'Burundi': 'bi',
  'Cambodia': 'kh',
  'Cameroon': 'cm',
  'Canada': 'ca',
  'Cape Verde': 'cv',
  'Central African Republic': 'cf',
  'Chad': 'td',
  'Chile': 'cl',
  'China': 'cn',
  'Colombia': 'co',
  'Comoros': 'km',
  'Congo': 'cg',
  'Costa Rica': 'cr',
  'Croatia': 'hr',
  'Cuba': 'cu',
  'Cyprus': 'cy',
  'Czech Republic': 'cz',
  'Denmark': 'dk',
  'Djibouti': 'dj',
  'Dominica': 'dm',
  'Dominican Republic': 'do',
  'Ecuador': 'ec',
  'Egypt': 'eg',
  'El Salvador': 'sv',
  'Equatorial Guinea': 'gq',
  'Eritrea': 'er',
  'Estonia': 'ee',
  'Eswatini': 'sz',
  'Ethiopia': 'et',
  'Fiji': 'fj',
  'Finland': 'fi',
  'France': 'fr',
  'Gabon': 'ga',
  'Gambia': 'gm',
  'Georgia': 'ge',
  'Germany': 'de',
  'Ghana': 'gh',
  'Greece': 'gr',
  'Grenada': 'gd',
  'Guatemala': 'gt',
  'Guinea': 'gn',
  'Guinea-Bissau': 'gw',
  'Guyana': 'gy',
  'Haiti': 'ht',
  'Honduras': 'hn',
  'Hungary': 'hu',
  'Iceland': 'is',
  'India': 'in',
  'Indonesia': 'id',
  'Iran': 'ir',
  'Iraq': 'iq',
  'Ireland': 'ie',
  'Israel': 'il',
  'Italy': 'it',
  'Ivory Coast': 'ci',
  'Jamaica': 'jm',
  'Japan': 'jp',
  'Jordan': 'jo',
  'Kazakhstan': 'kz',
  'Kenya': 'ke',
  'Kiribati': 'ki',
  'Kosovo': 'xk',
  'Kuwait': 'kw',
  'Kyrgyzstan': 'kg',
  'Laos': 'la',
  'Latvia': 'lv',
  'Lebanon': 'lb',
  'Lesotho': 'ls',
  'Liberia': 'lr',
  'Libya': 'ly',
  'Liechtenstein': 'li',
  'Lithuania': 'lt',
  'Luxembourg': 'lu',
  'Madagascar': 'mg',
  'Malawi': 'mw',
  'Malaysia': 'my',
  'Maldives': 'mv',
  'Mali': 'ml',
  'Malta': 'mt',
  'Marshall Islands': 'mh',
  'Mauritania': 'mr',
  'Mauritius': 'mu',
  'Mexico': 'mx',
  'Micronesia': 'fm',
  'Moldova': 'md',
  'Monaco': 'mc',
  'Mongolia': 'mn',
  'Montenegro': 'me',
  'Morocco': 'ma',
  'Mozambique': 'mz',
  'Myanmar': 'mm',
  'Namibia': 'na',
  'Nauru': 'nr',
  'Nepal': 'np',
  'Netherlands': 'nl',
  'New Zealand': 'nz',
  'Nicaragua': 'ni',
  'Niger': 'ne',
  'Nigeria': 'ng',
  'North Korea': 'kp',
  'Norway': 'no',
  'Oman': 'om',
  'Pakistan': 'pk',
  'Palau': 'pw',
  'Palestine': 'ps',
  'Panama': 'pa',
  'Papua New Guinea': 'pg',
  'Paraguay': 'py',
  'Peru': 'pe',
  'Philippines': 'ph',
  'Poland': 'pl',
  'Portugal': 'pt',
  'Qatar': 'qa',
  'Romania': 'ro',
  'Russia': 'ru',
  'Rwanda': 'rw',
  'Saint Kitts and Nevis': 'kn',
  'Saint Lucia': 'lc',
  'Saint Vincent and the Grenadines': 'vc',
  'Samoa': 'ws',
  'San Marino': 'sm',
  'Saudi Arabia': 'sa',
  'Senegal': 'sn',
  'Serbia': 'rs',
  'Seychelles': 'sc',
  'Sierra Leone': 'sl',
  'Singapore': 'sg',
  'Slovakia': 'sk',
  'Slovenia': 'si',
  'Solomon Islands': 'sb',
  'Somalia': 'so',
  'South Africa': 'za',
  'South Korea': 'kr',
  'South Sudan': 'ss',
  'Spain': 'es',
  'Sri Lanka': 'lk',
  'Sudan': 'sd',
  'Suriname': 'sr',
  'Sweden': 'se',
  'Switzerland': 'ch',
  'Syria': 'sy',
  'Taiwan': 'tw',
  'Tajikistan': 'tj',
  'Tanzania': 'tz',
  'Thailand': 'th',
  'Togo': 'tg',
  'Tonga': 'to',
  'Trinidad and Tobago': 'tt',
  'Tunisia': 'tn',
  'Turkey': 'tr',
  'Turkmenistan': 'tm',
  'Tuvalu': 'tv',
  'Uganda': 'ug',
  'Ukraine': 'ua',
  'United Arab Emirates': 'ae',
  'United Kingdom': 'gb',
  'USA': 'us',
  'Uruguay': 'uy',
  'Uzbekistan': 'uz',
  'Vanuatu': 'vu',
  'Vatican City': 'va',
  'Venezuela': 've',
  'Vietnam': 'vn',
  'Yemen': 'ye',
  'Zambia': 'zm',
  'Zimbabwe': 'zw'
};



// Регулярные выражения для валидации данных
const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const timeRegex = /^(\d{2})\.(\d{2})-(\d{2})\.(\d{2})$/;

// ---------------------------------------------
// ОБРАБОТЧИКИ ОСНОВНЫХ КОМАНД
// ---------------------------------------------

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id; 

  deleteAllTrackedResultMessages(chatId);
  await deleteTrackedStartMessages(chatId);  // Удаление старых сообщений перед новым стартом
  trackStart(chatId, msg.message_id);

  if (states[chatId]) {
    delete states[chatId]; // Удаляем состояние пользователя из хранилища
    setTimeout(() => {
      deleteAllTrackedMessages(chatId); // Удаляем все отслеживаемые сообщения для этого чата
    }, 500); 
  }
  setTimeout(() => {
    deleteAllTrackedMessages(chatId); // Удаляем все отслеживаемые сообщения для этого чата
  }, 500); 
  
  const username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`;
  const message = `Аккаунт успешно создан для ${username}.\n/help`;
  console.log(userId);

  // Кнопки выбора действия
  const options = {
    reply_markup: {
      keyboard: [
        [{ text: 'Ищу услугу' }, { text: 'Предоставляю услугу' }],
        [{ text: 'Мои заявки' }, { text: '/help' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };

  // Отправляем сообщение с кнопками на месте клавиатуры
  setTimeout(async () => {
    await sendAndTrackStartMessage(chatId, message, options);
  }, 500); 
});


// Обработка команды /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  deleteAllTrackedResultMessages(chatId);
  deleteAllTrackedHelpMessages(chatId);  // Удаление старых сообщений перед новым стартом
  trackHelp(chatId, msg.message_id);

  if (states[chatId]) {
    delete states[chatId]; // Удаляем состояние пользователя из хранилища
    setTimeout(() => {
      deleteAllTrackedMessages(chatId); // Удаляем все отслеживаемые сообщения для этого чата
    }, 500); 
  }
  setTimeout(() => {
    deleteAllTrackedMessages(chatId); // Удаляем все отслеживаемые сообщения для этого чата
  }, 500); 

  // Сообщение помощи с кратким описанием команд
  const helpMessage = `
*Доступные команды бота:*

1. \`/start\` — Начало работы с ботом, регистрация аккаунта.
2. \`Ищу услугу\` — Поиск услуги в выбранной стране и городе.
3. \`Предоставляю услугу\` — Добавить предложение об услуге.
4. \`Мои заявки\` — Показать все текущие заявки пользователя.
5. \`/help\` — Показать это сообщение.

Выберите действие из списка или введите одну из команд.
  `;

  // Отправка сообщения с помощью и отслеживание его ID (в дальнейшем это можно использовать для удаления или дополнительной обработки)
  setTimeout(async () => {
    await sendAndTrackHelpMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
  }, 500); 
});




const axios = require('axios');

// Конфигурация Geonames
const GEONAMES_USERNAME = 'acp044'; // Ваше имя пользователя Geonames
const COUNTRY_CODE = 'EE'; // Код страны для проверки

// Функция для проверки написания города
async function checkCityName(cityName, countryCode = COUNTRY_CODE) {
  try {
    // Отправляем запрос к Geonames API
    const response = await axios.get('http://api.geonames.org/searchJSON', {
      params: {
        q: cityName,         // Название города для поиска
        country: countryCode, // Код страны
        maxRows: 5,          // Количество возвращаемых результатов
        username: GEONAMES_USERNAME, // Ваше имя пользователя Geonames
        featureClass: 'P',   // Только населенные пункты
      },
    });

    // Проверяем, есть ли результаты
    if (response.data.geonames && response.data.geonames.length > 0) {
      // Фильтруем результаты и возвращаем имена городов
      const matchingCities = response.data.geonames.map((city) => city.name);
      console.log(`Совпадения для "${cityName}" в стране ${countryCode}:`, matchingCities);

      // Пытаемся найти точное совпадение
      const exactMatch = matchingCities.find(
        (name) => name.toLowerCase() === cityName.toLowerCase()
      );

      if (exactMatch) {
        console.log(`Город "${exactMatch}" найден.`);
        return { isValid: true, matchedCity: exactMatch };
      } else {
        console.log(`Точное совпадение не найдено. Предлагаемые варианты: ${matchingCities.join(', ')}`);
        return { isValid: false, suggestions: matchingCities };
      }
    } else {
      console.log(`Город "${cityName}" не найден в стране ${countryCode}.`);
      return { isValid: false, suggestions: [] };
    }
  } catch (error) {
    console.error('Ошибка при запросе к Geonames API:', error);
    return { isValid: false, suggestions: [] };
  }
}

// Пример использования
checkCityName('Питер').then((result) => {
  if (result.isValid) {
    console.log(`Город подтвержден: ${result.matchedCity}`);
  } else {
    console.log('Ошибка в написании города. Предложения:', result.suggestions);
  }
});



const messagesToDelete = {}; // Глобальное хранилище для отслеживания сообщений
const startMessagesToDelete = {};
const listMessagesToDelete = {};
const helpMessagesToDelete = {};
const resultMessagesToDelete = {};
const contactMessagesToDelete = {};

function trackMessage(chatId, messageId, text) {
  // Игнорируем команды /start и /help
  if (text === '/start' || text === '/help') return;

  if (!messagesToDelete[chatId]) {
    messagesToDelete[chatId] = [];
  }
  messagesToDelete[chatId].push(messageId);
}

function trackStart(chatId, messageId) {
  if (!startMessagesToDelete[chatId]) {
    startMessagesToDelete[chatId] = [];
  }
  startMessagesToDelete[chatId].push(messageId);
}

function trackList(chatId, messageId) {
  if (!listMessagesToDelete[chatId]) {
    listMessagesToDelete[chatId] = [];
  }
  listMessagesToDelete[chatId].push(messageId);
}

function trackHelp(chatId, messageId) {
  if (!helpMessagesToDelete[chatId]) {
    helpMessagesToDelete[chatId] = [];
  }
  helpMessagesToDelete[chatId].push(messageId);
}

// Функция для отправки и отслеживания сообщений
async function sendAndTrackMessage(chatId, message, options = {}) {
  const sentMsg = await bot.sendMessage(chatId, message, options);
  if (!messagesToDelete[chatId]) {
    messagesToDelete[chatId] = [];
  }
  messagesToDelete[chatId].push(sentMsg.message_id);
  return sentMsg;
}

async function sendAndTrackResultMessage(chatId, message, options = {}) {
  const sentMsg = await bot.sendMessage(chatId, message, options);
  if (!resultMessagesToDelete[chatId]) {
    resultMessagesToDelete[chatId] = [];
  }
  resultMessagesToDelete[chatId].push(sentMsg.message_id);
  return sentMsg;
}

async function sendAndTrackContactMessage(chatId, message, options = {}) {
  try {
    const sentMsg = await bot.sendMessage(chatId, message, options);
    
    // Добавляем сообщение в список сообщений для удаления
    if (!contactMessagesToDelete[chatId]) {
      contactMessagesToDelete[chatId] = [];
    }
    contactMessagesToDelete[chatId].push(sentMsg.message_id);

    console.log(`Сообщение отправлено. ID: ${sentMsg.message_id}. Удаление запланировано через 6 часов.`);

    // Запускаем таймер для удаления сообщения через 6 часов
    setTimeout(() => {
      // Удаление конкретного сообщения
      bot.deleteMessage(chatId, sentMsg.message_id).then(() => {
        console.log(`Сообщение с ID: ${sentMsg.message_id} успешно удалено через 6 часов.`);

        // Удаляем ID сообщения из массива после успешного удаления
        contactMessagesToDelete[chatId] = contactMessagesToDelete[chatId].filter(
          (id) => id !== sentMsg.message_id
        );
      }).catch((error) => {
        console.error(`Ошибка при удалении сообщения с ID: ${sentMsg.message_id}: ${error.message}`);
      });
    }, 10 * 1000);

    return sentMsg;
  } catch (error) {
    console.error(`Ошибка при отправке сообщения: ${error.message}`);
    return null;
  }
}

async function sendAndTrackStartMessage(chatId, message, options) {
  try {
    const sentMsg = await bot.sendMessage(chatId, message, options);
    trackStart(chatId, sentMsg.message_id);
  } catch (err) {
    console.log(`Ошибка отправки сообщения: ${err.message}`);
  }
}

async function sendAndTrackListMessage(chatId, message, options = {}) {
  const sentMsg = await bot.sendMessage(chatId, message, options);
  trackList(chatId, sentMsg.message_id);
  return sentMsg;
}

async function sendAndTrackHelpMessage(chatId, message, options = {}) {
  const sentMsg = await bot.sendMessage(chatId, message, options);
  trackHelp(chatId, sentMsg.message_id);
  return sentMsg;
}

// Функция для удаления всех отслеживаемых сообщений для определенного чата
function deleteAllTrackedMessages(chatId) {
  if (messagesToDelete[chatId]) {
    messagesToDelete[chatId].forEach((messageId) => {
      bot.deleteMessage(chatId, messageId).catch((error) => {
        console.log(`Ошибка при удалении сообщения: ${error}`);
      });
    });
    // Очищаем список сообщений после удаления
    messagesToDelete[chatId] = [];
  }
}

function deleteAllTrackedResultMessages(chatId) {
  if (resultMessagesToDelete[chatId]) {
    resultMessagesToDelete[chatId].forEach((messageId) => {
      bot.deleteMessage(chatId, messageId).catch((error) => {
        console.log(`Ошибка при удалении сообщения: ${error}`);
      });
    });
    // Очищаем список сообщений после удаления
    resultMessagesToDelete[chatId] = [];
  }
}

function deleteAllTrackedContactMessages(chatId) {
  if (contactMessagesToDelete[chatId]) {
    contactMessagesToDelete[chatId].forEach((messageId) => {
      bot.deleteMessage(chatId, messageId).catch((error) => {
        console.log(`Ошибка при удалении сообщения: ${error}`);
      });
    });
    // Очищаем список сообщений после удаления
    contactMessagesToDelete[chatId] = [];
  }
}

async function deleteTrackedStartMessages(chatId) {
  if (startMessagesToDelete[chatId]) {
    for (const messageId of startMessagesToDelete[chatId]) {
      try {
        await bot.deleteMessage(chatId, messageId);
      } catch (err) {
        console.log(`Ошибка удаления сообщения ${messageId}: ${err.message}`);
      }
    }
    startMessagesToDelete[chatId] = [];
  }
}

function deleteAllTrackedListMessages(chatId) {
  if (listMessagesToDelete[chatId]) {
    listMessagesToDelete[chatId].forEach((messageId) => {
      bot.deleteMessage(chatId, messageId).catch((error) => {
        console.log(`Ошибка при удалении сообщения: ${error}`);
      });
    });
    listMessagesToDelete[chatId] = [];
  }
}

function deleteAllTrackedHelpMessages(chatId) {
  if (helpMessagesToDelete[chatId]) {
    helpMessagesToDelete[chatId].forEach((messageId) => {
      bot.deleteMessage(chatId, messageId).catch((error) => {
        console.log(`Ошибка при удалении сообщения: ${error}`);
      });
    });
    helpMessagesToDelete[chatId] = [];
  }
}

// ---------------------------------------------
// ОБРАБОТКА СООБЩЕНИЙ ОТ ПОЛЬЗОВАТЕЛЯ
// ---------------------------------------------

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userId = msg.from.id;

  trackMessage(chatId, msg.message_id, text);

  if (text === 'Ищу услугу') {  
    // Достаем все заявки пользователя на поиск услуг из базы данных
    const userSearchRequests = db.getSearchRequestsByUser(userId);
  
    // Проверяем количество активных заявок
    if (userSearchRequests.length >= 3) {
      deleteAllTrackedMessages(chatId);
      // Если заявок 3 или больше, отправляем сообщение об ограничении
      sendAndTrackMessage(chatId, 'У вас не может одновременно быть больше 3 заявок на поиск. Подождите пока они удалятся автоматически или удалите их вручную.');
      return;
    } else {
      deleteAllTrackedMessages(chatId);
      deleteAllTrackedResultMessages(chatId);
      // Если заявок меньше 3, начинаем процесс создания новой заявки
      states[chatId] = { step: 'search_1', responses: {} };
      sendAndTrackMessage(chatId, 'В какой стране вы хотите найти услугу? (Россия, Китай, Франция)');
    }
  } else if (text === 'Предоставляю услугу') {
    const userOfferRequests = db.getOfferRequestsByUser(userId);
    // Логика запускается при выборе "Предоставляю услугу"

    // Проверяем количество активных заявок
    if (userOfferRequests.length >= 3) {
      deleteAllTrackedMessages(chatId);
      // Если заявок 3 или больше, отправляем сообщение об ограничении
      sendAndTrackMessage(chatId, 'Вы не можете одновременно предоставлять больше 3 услуг. Подождите, пока они удалятся автоматически, или удалите их вручную.');
    } else {
      deleteAllTrackedMessages(chatId);
      deleteAllTrackedResultMessages(chatId);
      states[chatId] = { step: 'provide_1', responses: {} };
      sendAndTrackMessage(chatId, 'В какой стране вы хотите предоставить услугу? (Россия, Китай, Франция)');
    }
  } else if (text === 'Мои заявки') {

    deleteAllTrackedListMessages(chatId);
    deleteAllTrackedResultMessages(chatId);
    trackList(chatId, msg.message_id);
    // Логика получения заявок пользователя
    const searchRequests = db.getSearchRequestsByUser(userId);
    const offerRequests = db.getOfferRequestsByUser(userId);

    if (states[chatId]) {
      delete states[chatId]; // Удаляем состояние пользователя из хранилища
      setTimeout(() => {
        deleteAllTrackedMessages(chatId); // Удаляем все отслеживаемые сообщения для этого чата
      }, 500); 
    }
    setTimeout(() => {
      deleteAllTrackedMessages(chatId); // Удаляем все отслеживаемые сообщения для этого чата
    }, 500); 
  
    // Если есть заявки на поиск услуг
    if (searchRequests.length > 0) {
      let searchMessage = '🔍 **Ваши заявки на поиск услуг**:\n/help\n\n';
      searchRequests.forEach((req, index) => {
        searchMessage += `${index + 1}. ${req.country}, ${req.city}, ${req.date}, ${req.time}, ${req.amount} - ${req.description}\n${req.contact}\n\n`;
      });

      const searchOptions = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Удалить заявку на поиск', callback_data: 'delete_search' }],
          ],
        },
      };
      // Отправка сообщения только с заявками на поиск
      sendAndTrackListMessage(chatId, searchMessage, searchOptions);
    }
  
    // Если есть заявки на предоставление услуг
    if (offerRequests.length > 0) {
      let offerMessage = '💼 **Ваши заявки на предоставление услуг**:\n/help\n\n';
      offerRequests.forEach((req, index) => {
        offerMessage += `${index + 1}. ${req.country}, ${req.city}, ${req.date}, ${req.time}, ${req.amount} - ${req.description}\n${req.contact}\n\n`;
      });

      const offerOptions = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Удалить заявку предложения', callback_data: 'delete_offer' }],
          ],
        },
      };
  
      // Отправка сообщения только с заявками на предоставление
      sendAndTrackListMessage(chatId, offerMessage, offerOptions);
    }
  
    // Если нет ни заявок на поиск, ни заявок на предоставление услуг
    if (searchRequests.length === 0 && offerRequests.length === 0) {
      sendAndTrackListMessage(chatId, 'У вас нет активных заявок.\n/help');
    }

    setTimeout(() => {
      deleteAllTrackedListMessages(chatId);
    }, (15 * 60 * 1000));
  
  } else {
    if (states[chatId]) {
      const userState = states[chatId];
      if (userState.step.startsWith('search')) {
        handleSearchService(chatId, text, userState, userId);
      } else if (userState.step.startsWith('provide')) {
        handleProvideService(chatId, text, userState, userId);
      }
    }
  }
});

// Обработка нажатий на inline кнопки
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;

  if (states[chatId]) {
    delete states[chatId]; // Удаляем состояние пользователя из хранилища
    setTimeout(() => {
      deleteAllTrackedMessages(chatId); // Удаляем все отслеживаемые сообщения для этого чата
    }, 200); 
  }
  setTimeout(() => {
    deleteAllTrackedMessages(chatId); // Удаляем все отслеживаемые сообщения для этого чата
  }, 200); 

  // Если нажата кнопка "Удалить заявку на поиск"
  if (data === 'delete_search') {
    states[chatId] = { step: 'delete_search_request', requests: db.getSearchRequestsByUser(userId) };
    setTimeout(() => {
      sendAndTrackMessage(chatId, 'Введите номер заявки на поиск, которую хотите удалить (например, 1, 2, 3).');
    }, 500); 
  }
  // Если нажата кнопка "Удалить заявку предложения"
  else if (data === 'delete_offer') {
    states[chatId] = { step: 'delete_offer_request', requests: db.getOfferRequestsByUser(userId) };
    setTimeout(() => {
      sendAndTrackMessage(chatId, 'Введите номер заявки предложения, которую хотите удалить (например, 1, 2, 3).');
    }, 500); 
  }

});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id; // ID сообщения с кнопкой
  const data = callbackQuery.data;

  // Проверяем, начинается ли callback_data с 'reply_'
  if (data.startsWith('reply_')) {
    const offerId = data.replace('reply_', ''); // Извлекаем offerId из callback_data

    try {
      // Асинхронно получаем данные предложения из Redis по offerId
      const result = await redisClient.get(offerId);

      if (result) {
        const offerInfo = JSON.parse(result); // Декодируем данные из Redis

        // Формируем сообщение с контактной информацией и подробностями заявки
        const replyMessage = `📩 *Контактная информация и подробности*\n` +
                             `Это сообщение удалится через 6 часов\n\n` +
                             `Город: ${offerInfo.city}\n` +
                             `Дата: ${offerInfo.date}\n` +
                             `Время: ${offerInfo.time}\n` +
                             `Сумма: ${offerInfo.amount}\n` +
                             `Описание услуги: ${offerInfo.description}\n` +
                             `Контакт: ${offerInfo.contact}\n\n` +
                             `Свяжитесь с предоставителем услуги, чтобы обсудить детали.`;

        // Отправляем сообщение пользователю с контактной информацией
        await sendAndTrackContactMessage(chatId, replyMessage, { parse_mode: 'Markdown' });

        // Удаляем сообщение с кнопкой после отправки контактной информации
        await bot.deleteMessage(chatId, messageId);
      } else {
        await sendAndTrackMessage(chatId, 'Это предложение больше не доступно.');
      }
    } catch (err) {
      console.error('Ошибка получения данных из Redis:', err);
      await sendAndTrackMessage(chatId, 'Не удалось получить данные о предложении.');
    }
  }
});



bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userId = msg.from.id;

  // Проверка на ввод номера заявки для удаления
  if (states[chatId]) {
    const userState = states[chatId];

    // Удаление заявки на поиск по индексу
    if (userState.step === 'delete_search_request') {
      const index = parseInt(text, 10) - 1;
      if (index >= 0 && index < userState.requests.length) {
        const selectedRequest = userState.requests[index];
        // Используем новую функцию для удаления заявки на поиск услуг
        db.deleteSearchRequest(userId, selectedRequest.country, selectedRequest.city, selectedRequest.date, selectedRequest.time, selectedRequest.amount, selectedRequest.description);
        sendAndTrackMessage(chatId, `Заявка на поиск услуг номер ${text} была успешно удалена.`);
        deleteAllTrackedListMessages(chatId);
      } else {
        sendAndTrackMessage(chatId, 'Некорректный номер заявки. Пожалуйста, введите правильный номер.');
      }
      delete states[chatId];
      setTimeout(() => {
        deleteAllTrackedMessages(chatId); // Удаляем все отслеживаемые сообщения для этого чата
      }, 5000); 
    }

    // Удаление заявки на предложение по индексу
    else if (userState.step === 'delete_offer_request') {
      const index = parseInt(text, 10) - 1;
      if (index >= 0 && index < userState.requests.length) {
        const selectedRequest = userState.requests[index];
        // Используем новую функцию для удаления заявки на предоставление услуг
        db.deleteOfferRequest(userId, selectedRequest.country, selectedRequest.city, selectedRequest.date, selectedRequest.time, selectedRequest.amount, selectedRequest.description);
        sendAndTrackMessage(chatId, `Заявка на предоставление услуг номер ${text} была успешно удалена.`);
        deleteAllTrackedListMessages(chatId);
      } else {
        sendAndTrackMessage(chatId, 'Некорректный номер заявки. Пожалуйста, введите правильный номер.');
      }
      delete states[chatId];
      setTimeout(() => {
        deleteAllTrackedMessages(chatId); // Удаляем все отслеживаемые сообщения для этого чата
      }, 5000); 
    }
  }
});

// ---------------------------------------------
// ЛОГИКА ДЛЯ ОБРАБОТКИ ПОИСКА УСЛУГИ
// ---------------------------------------------

function handleSearchService(chatId, text, userState, userId) {
  switch (userState.step) {
    case 'search_1':
      const bestMatchCountry = findClosestCountry(text);
      if (bestMatchCountry) {
        const englishCountryName = countryMapping[bestMatchCountry] || bestMatchCountry;
        userState.responses.country = englishCountryName;

        userState.step = 'search_2';
        sendAndTrackMessage(chatId, `Страна выбрана: ${bestMatchCountry}. Укажите город: (Москва, Париж, Берлин)`);
      } else {
        sendAndTrackMessage(chatId, 'Не могу найти страну с таким названием. Попробуйте снова.');
      }
      break;
    
      case 'search_2':

      userState.responses.city = text;
      userState.step = 'search_3';
      sendAndTrackMessage(chatId, 'Укажите дату, когда вам нужна услуга (например, 01/10/2023). Дата не может быть позже чем через неделю от текущей даты.');
      break;


    case 'search_3':
  if (!dateRegex.test(text)) {
    sendAndTrackMessage(chatId, 'Неверный формат даты. Укажите дату в формате DD/MM/YYYY (например, 01/10/2023).');
    } else {
    const [_, day, month, year] = text.match(dateRegex);
    const inputDate = new Date(`${year}-${month}-${day}`);

    // Проверка на реальность даты (например, 71 число 84 месяца)
    const isValidDate = (d, m, y) => {
      const date = new Date(`${y}-${m}-${d}`);
      return date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d;
    };

    if (!isValidDate(day, month, year)) {
      sendAndTrackMessage(chatId, 'Введена нереальная дата. Убедитесь, что день, месяц и год указаны правильно.');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Сброс времени на 00:00 для корректного сравнения

      // Дата через 7 дней от сегодняшнего дня
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 7);
      maxDate.setHours(0, 0, 0, 0);

      // Проверка на актуальность и дальность даты
      if (inputDate < today) {
        sendAndTrackMessage(chatId, 'Дата не может быть в прошлом. Укажите сегодняшнюю или будущую дату.');
      } else if (inputDate > maxDate) {
        sendAndTrackMessage(chatId, 'Дата не может быть позже, чем через 7 дней от сегодняшнего дня.');
      } else {
        userState.responses.date = text;
        userState.step = 'search_4';
        sendAndTrackMessage(chatId, 'Укажите время, когда вам нужна услуга (например, 14.30-15.30). Если вы ищете услугу в любое время, то укажите (00.00-23.59).');
      }
    }
  }
  break;


  case 'search_4':
    // Проверка формата времени
    if (validateTimeFormat(text)) {
      // Извлечение компонентов времени из ввода
      const [, startHour, startMinute, endHour, endMinute] = text.match(timeRegex);
  
      // Преобразование значений в числа
      const startH = parseInt(startHour, 10);
      const startM = parseInt(startMinute, 10);
      const endH = parseInt(endHour, 10);
      const endM = parseInt(endMinute, 10);
  
      // Проверка: часы и минуты должны быть в корректных диапазонах
      if (startH < 0 || startH > 23 || startM < 0 || startM > 59 || endH < 0 || endH > 23 || endM < 0 || endM > 59) {
        sendAndTrackMessage(chatId, 'Введено нереальное время. Убедитесь, что часы от 00 до 23, а минуты — от 00 до 59.');
        break;
      }
  
      // Проверка: если дата - сегодняшняя, начальное время должно быть больше текущего времени пользователя
      const [day, month, year] = userState.responses.date.split('/');
      const inputDate = new Date(`${year}-${month}-${day}`);
      const today = new Date();
  
      // Проверка на совпадение с сегодняшним днем
      if (
        inputDate.getFullYear() === today.getFullYear() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getDate() === today.getDate()
      ) {
        // Получаем текущее время
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
  
        // Проверка: начальное время должно быть строго больше текущего времени
        if (startH < currentHour || (startH === currentHour && startM <= currentMinute)) {
          sendAndTrackMessage(
            chatId,
            `Начальное время услуги не может быть меньше или равно текущему времени (${currentHour}.${currentMinute}). Укажите время больше текущего времени.`
          );
          break;
        }
      }
  
  
      // Если время корректно, сохраняем его и переходим к следующему шагу
      userState.responses.time = text;
      userState.step = 'search_5';
      sendAndTrackMessage(chatId, 'Укажите сумму, которую вы готовы заплатить за услугу (например, 5000 рублей, 30 евро, 100 юаней):');
    } else {
      // Сообщение об ошибке формата
      sendAndTrackMessage(chatId, 'Неверный формат времени. Укажите время в формате HH.MM-HH.MM (например, 14.30-15.30).');
    }
    break;
    
    case 'search_5':
      userState.responses.amount = text;
      userState.step = 'search_6';
      sendAndTrackMessage(chatId, 'Введите время, которая ваша заявка будет активна. От 1 до 24 часов. Введите только число:');
      break;

      case 'search_6':
        const Timer = Number(text); // Преобразуем текст в число
        if (isNaN(Timer) || Timer < 1 || Timer > 24 || !Number.isInteger(Timer)) {
          sendAndTrackMessage(chatId, 'Некорректное значение таймера. Укажите целое число от 1 до 24 (например, 3).');
          break;
        }
      
        // Если значение таймера корректное, сохраняем его и переходим к следующему шагу
        userState.responses.timer = text;
        userState.step = 'search_7';
        sendAndTrackMessage(chatId, 'Опишите, какую услугу вы ищете:');
        break;

    case 'search_7':
      userState.responses.description = text;
      userState.step = 'search_8';
      sendAndTrackMessage(chatId, 'Оставьте свои контакные данные (например, +7 12345678, пример@почты.com, @Никнейм)');
      break;

    case 'search_8':
      userState.responses.contact = text;

      const currentDateTime = new Date();
      // Преобразуем таймер из строки в целое число (в часах)
      const timerHours = parseInt(userState.responses.timer, 10);
      // Добавляем количество часов к текущему времени
      const deletionDate = new Date(currentDateTime.getTime() + timerHours * 60 * 60 * 1000);
      // Преобразуем дату в строку в формате: YYYY-MM-DD HH:MM
      const deletion = `${deletionDate.getFullYear()}-${(deletionDate.getMonth() + 1).toString().padStart(2, '0')}-${deletionDate.getDate().toString().padStart(2, '0')} ${deletionDate.getHours().toString().padStart(2, '0')}:${deletionDate.getMinutes().toString().padStart(2, '0')}`;

      
      const searchSummary = `Вы успешно составили заявку на поиск услуги!\n\nСтрана: ${userState.responses.country}\nГород: ${userState.responses.city}\nДата: ${userState.responses.date}\nВремя: ${userState.responses.time}\nСумма: ${userState.responses.amount}\nОписание: ${userState.responses.description}\nContact: ${userState.responses.contact}`;
      
      const { country, city, date, time, amount, description, contact } = userState.responses;
      db.addSearchRequest(userId, country, city, date, time, amount, description, contact, deletion);
      
      sendAndTrackResultMessage(chatId, searchSummary);

            // Получение всех предложений из таблицы `offer`
            const offerRequests = db.getOffersByCountry(userState.responses.country);

            if (offerRequests.length > 0) {
              // Проверка для режимов сортировки и фильтрации
              const ignoreCity = userState.responses.city === "-";
              const ignoreDescription = userState.responses.description === "-";
            
              let sortedOffers;
            
              // Если оба поля — "-", выбираем 10 случайных предложений
              if (ignoreCity && ignoreDescription) {
                sortedOffers = offerRequests.sort(() => 0.5 - Math.random()).slice(0, 10);
              } else {
                // Сравниваем введенные данные с предложениями и вычисляем индексы схожести
                sortedOffers = offerRequests
                  .map((offer) => {
                    const citySimilarity = ignoreCity
                      ? 1 // Если игнорируем город, ставим максимальное значение для citySimilarity
                      : natural.JaroWinklerDistance(userState.responses.city.toLowerCase(), offer.city.toLowerCase());
            
                    const descriptionSimilarity = ignoreDescription
                      ? 1 // Если игнорируем описание, ставим максимальное значение для descriptionSimilarity
                      : natural.JaroWinklerDistance(userState.responses.description.toLowerCase(), offer.description.toLowerCase());
                    
                    return { ...offer, citySimilarity, descriptionSimilarity };
                  })
                  .sort((a, b) => {
                    // Сортируем сначала по индексу схожести города, если сравниваем города
                    if (!ignoreCity && b.citySimilarity !== a.citySimilarity) {
                      return b.citySimilarity - a.citySimilarity;
                    }
                    // Сортируем по индексу схожести описания
                    return b.descriptionSimilarity - a.descriptionSimilarity;
                  });
            
                // Фильтруем предложения по схожести, если игнорирование не установлено
                const relevantOffers = sortedOffers.filter((offer) => {
                  return (ignoreCity || offer.citySimilarity >= 0.7) && (ignoreDescription || offer.descriptionSimilarity >= 0.5);
                });
            
                // Оставляем только 5 самых подходящих предложений
                sortedOffers = relevantOffers.slice(0, 5);
              }
            

              if (sortedOffers.length > 0) {
                sortedOffers.forEach((offer, index) => {
                  // Генерируем уникальный ключ для предложения
                  const offerId = `offer:${generateRandomId()}`; // Например, "offer:12345"
                  const offerMessage = `📋 *Предложение*\n\n` +
                                       `Страна: ${offer.country}\n` +
                                       `Город: ${offer.city}\n` +
                                       `Дата: ${offer.date}\n` +
                                       `Время: ${offer.time}\n` +
                                       `Сумма: ${offer.amount}\n` +
                                       `Описание: ${offer.description}\n`;
              
                  // Сохраняем предложение в Redis с уникальным ключом и сроком жизни 1 час
                  try {
                    // Асинхронно сохраняем предложение в Redis с уникальным ключом и сроком жизни 1 час
                    saveOfferToRedis(offerId, offer);
              
                    // Кнопка "Ответить" с сохранением offerId в callback_data
                    const replyOptions = {
                      reply_markup: {
                        inline_keyboard: [
                          [{ text: 'Ответить', callback_data: `reply_${offerId}` }],
                        ],
                      },
                      parse_mode: 'Markdown',
                    };
              
                    // Отправляем сообщение с кнопкой
                    setTimeout(() => {
                      sendAndTrackResultMessage(chatId, offerMessage, replyOptions);
                    }, index * 100); // Задержка перед отправкой каждого сообщения (100 мс)
              
                  } catch (err) {
                    console.error(`Ошибка сохранения предложения ${offerId} в Redis:`, err);
                  }
                });
              
            
              } else {
                // Сообщение в случае отсутствия предложений
                const cityMatches = sortedOffers.filter((offer) => offer.citySimilarity >= 0.7);

                if (cityMatches.length === 0) {
                  setTimeout(() => {
                    sendAndTrackResultMessage(chatId, 'На данный момент нет совпадений по указанному городу. Попробуйте изменить запрос.\n/help');
                  }, 500);
                } else {
                  // Понижаем порог схожести по описанию до 0.3 и выводим альтернативные предложения
                  const alternativeOffers = cityMatches.filter((offer) => offer.descriptionSimilarity >= 0.3);

                  if (alternativeOffers.length > 0) {
                    sendAndTrackResultMessage(chatId, 'Совпадений по вашему запросу не найдено, но может вас заинтересуют эти предложения:\n/help\n\n');
                
                    alternativeOffers.forEach((offer, index) => {
                      const offerId = `offer:${generateRandomId()}`;
                      let alternativeMessage = `💡 *Альтернативное предложение*:\n\n` +
                                               `Страна: ${offer.country}\n` +
                                               `Город: ${offer.city}\n` +
                                               `Дата: ${offer.date}\n` +
                                               `Время: ${offer.time}\n` +
                                               `Сумма: ${offer.amount}\n` +
                                               `Описание: ${offer.description}\n` +
                                               `Контакт: ${offer.contact}`;
                      try {
                    // Асинхронно сохраняем предложение в Redis с уникальным ключом и сроком жизни 1 час
                        saveOfferToRedis(offerId, offer);
                      // Кнопка "Ответить"
                      const alternativeOptions = {
                        reply_markup: {
                          inline_keyboard: [
                            [{ text: 'Ответить', callback_data: `reply_${offerId}` }],
                          ],
                        },
                        parse_mode: 'Markdown',
                      };
              
                      // Отправляем каждое альтернативное предложение отдельно с кнопкой
                      setTimeout(() => {
                        sendAndTrackResultMessage(chatId, alternativeMessage, alternativeOptions);
                      }, index * 100); // Задержка перед отправкой каждого сообщения
                      } catch (err) {
                        console.error(`Ошибка сохранения предложения ${offerId} в Redis:`, err);
                      }
                    });


                  } else {
                    setTimeout(() => {
                      sendAndTrackResultMessage(chatId, 'На данный момент нет совпадений по услугам в этом городе.\n/help');
                    }, 500);
                  }
                }
              }
            
            
            } else {
              // Сообщение в случае отсутствия предложений по стране
              setTimeout(() => {
                sendAndTrackResultMessage(chatId, 'На данный момент нет доступных предложений по указанной стране.\n/help');
              }, 500);
            }
            deleteAllTrackedMessages(chatId);
            delete states[chatId];
            break;
            

  }
}

// ---------------------------------------------
// ЛОГИКА ДЛЯ ОБРАБОТКИ ПРЕДОСТАВЛЕНИЯ УСЛУГИ
// ---------------------------------------------

function handleProvideService(chatId, text, userState, userId) {
  switch (userState.step) {
    case 'provide_1':
      const bestMatchCountry = findClosestCountry(text);
      if (bestMatchCountry) {
        const englishCountryName = countryMapping[bestMatchCountry] || bestMatchCountry;
        userState.responses.country = englishCountryName;

        const countryISOCode = countryToISO[englishCountryName];
        console.log(countryISOCode);
        userState.step = 'provide_2';
        sendAndTrackMessage(chatId, `Страна выбрана: ${bestMatchCountry}. Укажите город: (Москва, Париж, Берлин)`);
      } else {
        sendAndTrackMessage(chatId, 'Не могу найти страну с таким названием. Попробуйте снова.');
      }
      break;
    
      case 'provide_2':

      userState.responses.city = text;
      userState.step = 'provide_3';
      sendAndTrackMessage(chatId, 'Укажите дату, когда вы готовы оказать услугу (например, 01/10/2023). Дата не может быть позже чем через неделю от текущей даты.');
      break;


    case 'provide_3':
  if (!dateRegex.test(text)) {
    sendAndTrackMessage(chatId, 'Неверный формат даты. Укажите дату в формате DD/MM/YYYY (например, 01/10/2023).');
  } else {
    const [_, day, month, year] = text.match(dateRegex);
    const inputDate = new Date(`${year}-${month}-${day}`);

    // Проверка на реальность даты (например, 71 число 84 месяца)
    const isValidDate = (d, m, y) => {
      const date = new Date(`${y}-${m}-${d}`);
      return date.getFullYear() == y && date.getMonth() + 1 == m && date.getDate() == d;
    };

    if (!isValidDate(day, month, year)) {
      bot.sendMessage(chatId, 'Введена нереальная дата. Убедитесь, что день, месяц и год указаны правильно.');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Сброс времени на 00:00 для корректного сравнения

      // Дата через 7 дней от сегодняшнего дня
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 7);
      maxDate.setHours(0, 0, 0, 0);

      // Проверка на актуальность и дальность даты
      if (inputDate < today) {
        sendAndTrackMessage(chatId, 'Дата не может быть в прошлом. Укажите сегодняшнюю или будущую дату.');
      } else if (inputDate > maxDate) {
        sendAndTrackMessage(chatId, 'Дата не может быть позже, чем через 7 дней от сегодняшнего дня.');
      } else {
        userState.responses.date = text;
        userState.step = 'provide_4';
        sendAndTrackMessage(chatId, 'Укажите время, когда вам нужна услуга (например, 14.30-15.30). Если вы готовы оказать услугу в любое время, то укажите (00.00-23.59).');
      }
    }
  }
  break;


      case "provide_4":
        // Проверка формата времени
        if (validateTimeFormat(text)) {
        // Проверка, что время реально: часы от 0 до 23, минуты от 0 до 59
        const [, startHour, startMinute, endHour, endMinute] = text.match(timeRegex);

        // Проверяем, что время реально: часы от 0 до 23, минуты от 0 до 59
        const isRealTime = (hour, minute) => hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
    
        const startH = parseInt(startHour, 10);
        const startM = parseInt(startMinute, 10);
        const endH = parseInt(endHour, 10);
        const endM = parseInt(endMinute, 10);
    
        // Проверяем реальность времени начала и конца
        if (!isRealTime(startH, startM) || !isRealTime(endH, endM)) {
          sendAndTrackMessage(chatId, 'Введено нереальное время. Убедитесь, что часы от 00 до 23, а минуты — от 00 до 59.');
        } else {
          // Если время корректно, сохраняем его и переходим к следующему шагу
          userState.responses.time = text;
          userState.step = 'provide_5';
          sendAndTrackMessage(chatId, 'Укажите сумму за которую вы готовы выполнить услугу (например, 5000 рублей, 30 евро, 100 юаней):');
        }
      } else {
        // Сообщение об ошибке формата
        sendAndTrackMessage(chatId, 'Неверный формат времени. Укажите время в формате HH.MM-HH.MM (например, 14.30-15.30).');
      }
    
      break;

    case 'provide_5':
      userState.responses.amount = text;
      userState.step = 'provide_6';
      sendAndTrackMessage(chatId, 'Введите время, которая ваша заявка будет активна. От 1 до 24 часов. Введите только число:');
      break;

      case 'provide_6':
        const Timer = Number(text); // Преобразуем текст в число
        if (isNaN(Timer) || Timer < 1 || Timer > 24 || !Number.isInteger(Timer)) {
          sendAndTrackMessage(chatId, 'Некорректное значение таймера. Укажите целое число от 1 до 24 (например, 3).');
          break;
        }
      
        // Если значение таймера корректное, сохраняем его и переходим к следующему шагу
        userState.responses.timer = text;
        userState.step = 'provide_7';
        sendAndTrackMessage(chatId, 'Опишите, какую услугу вы предоставляете:');
        break;
      

    case 'provide_7':
      userState.responses.description = text;
      userState.step = 'provide_8';
      sendAndTrackMessage(chatId, 'Оставьте свои контакные данные (например, +7 12345678, пример@почты.com, @Никнейм)');
      break;

    case 'provide_8':
      userState.responses.contact = text;

      const currentDateTime = new Date();
      // Преобразуем таймер из строки в целое число (в часах)
      const timerHours = parseInt(userState.responses.timer, 10);
      // Добавляем количество часов к текущему времени
      const deletionDate = new Date(currentDateTime.getTime() + timerHours * 60 * 60 * 1000);
      // Преобразуем дату в строку в формате: YYYY-MM-DD HH:MM
      const deletion = `${deletionDate.getFullYear()}-${(deletionDate.getMonth() + 1).toString().padStart(2, '0')}-${deletionDate.getDate().toString().padStart(2, '0')} ${deletionDate.getHours().toString().padStart(2, '0')}:${deletionDate.getMinutes().toString().padStart(2, '0')}`;

      
      const searchSummary = `Вы успешно составили заявку на предоставление услуги!\n\nСтрана: ${userState.responses.country}\nГород: ${userState.responses.city}\nДата: ${userState.responses.date}\nВремя: ${userState.responses.time}\nСумма: ${userState.responses.amount}\nОписание: ${userState.responses.description}\nContact: ${userState.responses.contact}`;
      
      const { country, city, date, time, amount, description, contact } = userState.responses;
      db.addOfferRequest(userId, country, city, date, time, amount, description, contact, deletion);
      
      sendAndTrackResultMessage(chatId, searchSummary);
      
      const searchRequests = db.getSearchesByCountry(userState.responses.country);

      if (searchRequests.length > 0) {
        // Проверка для режимов сортировки и фильтрации
        const ignoreCity = userState.responses.city === "-";
        const ignoreDescription = userState.responses.description === "-";
      
        let sortedSearches;
      
        // Если оба поля — "-", выбираем 10 случайных предложений
        if (ignoreCity && ignoreDescription) {
          sortedSearches = searchRequests.sort(() => 0.5 - Math.random()).slice(0, 10);
        } else {
          // Сравниваем введенные данные с предложениями и вычисляем индексы схожести
          sortedSearches = searchRequests
            .map((search) => {
              const citySimilarity = ignoreCity
                ? 1 // Если игнорируем город, ставим максимальное значение для citySimilarity
                : natural.JaroWinklerDistance(userState.responses.city.toLowerCase(), search.city.toLowerCase());
      
              const descriptionSimilarity = ignoreDescription
                ? 1 // Если игнорируем описание, ставим максимальное значение для descriptionSimilarity
                : natural.JaroWinklerDistance(userState.responses.description.toLowerCase(), search.description.toLowerCase());
              
              return { ...search, citySimilarity, descriptionSimilarity };
            })
            .sort((a, b) => {
              // Сортируем сначала по индексу схожести города, если сравниваем города
              if (!ignoreCity && b.citySimilarity !== a.citySimilarity) {
                return b.citySimilarity - a.citySimilarity;
              }
              // Сортируем по индексу схожести описания
              return b.descriptionSimilarity - a.descriptionSimilarity;
            });
      
          // Фильтруем предложения по схожести, если игнорирование не установлено
          const relevantSearches = sortedSearches.filter((search) => {
            return (ignoreCity || search.citySimilarity >= 0.7) && (ignoreDescription || search.descriptionSimilarity >= 0.5);
          });
      
          // Оставляем только 5 самых подходящих предложений
          sortedSearches = relevantSearches.slice(0, 5);
        }
      
          if (sortedSearches.length > 0) {
            sortedSearches.forEach((offer, index) => {
              const offerId = `offer:${generateRandomId()}`;
              let searchMessage = `📋 *Заявки*\n\n` +
                                 `Страна: ${offer.country}\n` +
                                 `Город: ${offer.city}\n` +
                                 `Дата: ${offer.date}\n` +
                                 `Время: ${offer.time}\n` +
                                 `Сумма: ${offer.amount}\n` +
                                 `Описание: ${offer.description}\n`;
        
              // Кнопка "Ответить"
              try {
                // Асинхронно сохраняем предложение в Redis с уникальным ключом и сроком жизни 1 час
                saveOfferToRedis(offerId, offer);
          
                // Кнопка "Ответить" с сохранением offerId в callback_data
                const replyOptions = {
                  reply_markup: {
                    inline_keyboard: [
                      [{ text: 'Ответить', callback_data: `reply_${offerId}` }],
                    ],
                  },
                  parse_mode: 'Markdown',
                };
          
                // Отправляем сообщение с кнопкой
                setTimeout(() => {
                  sendAndTrackResultMessage(chatId, searchMessage, replyOptions);
                }, index * 100); // Задержка перед отправкой каждого сообщения (100 мс)
          
              } catch (err) {
                console.error(`Ошибка сохранения предложения ${offerId} в Redis:`, err);
              }
            });
      
        } else {
          // Сообщение в случае отсутствия предложений
          const cityMatches = sortedSearches.filter((search) => search.citySimilarity >= 0.7);

          if (cityMatches.length === 0) {
            setTimeout(() => {
              sendAndTrackResultMessage(chatId, 'На данный момент нет совпадений по указанному городу. Попробуйте изменить запрос.\n/help');
            }, 500);
          } else {
            // Понижаем порог схожести по описанию до 0.3 и выводим альтернативные предложения
            const alternativeSearches = cityMatches.filter((search) => search.descriptionSimilarity >= 0.3);

              if (alternativeSearches.length > 0) {
                sendAndTrackResultMessage(chatId, 'Совпадений по вашему запросу не найдено, но может вас заинтересуют эти предложения:\n/help\n\n');

                alternativeSearches.forEach((offer, index) => {
                  const offerId = `offer:${generateRandomId()}`;
                  let alternativeMessage = `💡 *Альтернативное предложение*:\n\n` +
                                           `Страна: ${offer.country}\n` +
                                           `Город: ${offer.city}\n` +
                                           `Дата: ${offer.date}\n` +
                                           `Время: ${offer.time}\n` +
                                           `Сумма: ${offer.amount}\n` +
                                           `Описание: ${offer.description}\n`;
          
                  // Кнопка "Ответить"
                  try {
                    // Асинхронно сохраняем предложение в Redis с уникальным ключом и сроком жизни 1 час
                    saveOfferToRedis(offerId, offer);
              
                    // Кнопка "Ответить" с сохранением offerId в callback_data
                    const alternativeOptions = {
                      reply_markup: {
                        inline_keyboard: [
                          [{ text: 'Ответить', callback_data: `reply_${offerId}` }],
                        ],
                      },
                      parse_mode: 'Markdown',
                    };
              
                    // Отправляем сообщение с кнопкой
                    setTimeout(() => {
                      sendAndTrackResultMessage(chatId, alternativeMessage, alternativeOptions);
                    }, index * 100); // Задержка перед отправкой каждого сообщения (100 мс)
              
                  } catch (err) {
                    console.error(`Ошибка сохранения предложения ${offerId} в Redis:`, err);
                  }
                });
            } else {
              setTimeout(() => {
                sendAndTrackResultMessage(chatId, 'На данный момент нет совпадений по услугам в этом городе.\n/help');
              }, 500);
            }
          }
        }
      
      } else {
        // Сообщение в случае отсутствия предложений по стране
        setTimeout(() => {
          sendAndTrackResultMessage(chatId, 'На данный момент нет доступных предложений по указанной стране.\n/help');
      }, 500);
      }
      deleteAllTrackedMessages(chatId);
      delete states[chatId];
      break;
  }
}

// ---------------------------------------------
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПРОВЕРКИ ДАННЫХ
// ---------------------------------------------


function validateTimeFormat(text) {
  return timeRegex.test(text);
}

bot.on('polling_error', (error) => {
  console.error(`Polling Error: ${error.code} - ${error.message}`);
});


function findClosestCountry(input) {
  let bestMatch = null;
  let highestScore = 0;

  countries.forEach((country) => {
    const score = natural.JaroWinklerDistance(input.toLowerCase(), country.toLowerCase());
    if (score > highestScore) {
      highestScore = score;
      bestMatch = country;
    }
  });

  return highestScore > 0.7 ? bestMatch : null;
}

function generateRandomId() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString(); // Генерируем случайное 10-значное число
}

async function saveOfferToRedis(offerId, offerData) {
  try {
    await redisClient.set(offerId, JSON.stringify(offerData), { EX: 3600 }); // EX: 3600 секунд (1 час)
    console.log(`Предложение ${offerId} успешно сохранено в Redis.`);
  } catch (err) {
    console.error('Ошибка сохранения данных в Redis:', err);
  }
}



// Запуск бота
console.log("Бот запущен и готов к работе...");
