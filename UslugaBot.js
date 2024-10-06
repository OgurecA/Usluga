// Импорт библиотек
const TelegramBot = require('node-telegram-bot-api');
const natural = require('natural');
const db = require('./Database.js');
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
  'United States', 'USA', 'США', 'Америка',
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
  'Russia': 'ru',
  'United States': 'us',
  'China': 'cn',
  'India': 'in',
  'Brazil': 'br',
  'Germany': 'de',
  'France': 'fr',
  'Japan': 'jp',
  'United Kingdom': 'gb',
  'Italy': 'it',
  'Mexico': 'mx',
  'Canada': 'ca',
  'Spain': 'es',
  'Ukraine': 'ua',
  'Netherlands': 'nl',
  'Turkey': 'tr',
  'Argentina': 'ar',
  'Australia': 'au',
  'Austria': 'at',
  'Belgium': 'be',
  'Bulgaria': 'bg',
  'Chile': 'cl',
  'Colombia': 'co',
  'Czech Republic': 'cz',
  'Denmark': 'dk',
  'Egypt': 'eg',
  'Finland': 'fi',
  'Greece': 'gr',
  'Hungary': 'hu',
  'Iceland': 'is',
  'Indonesia': 'id',
  'Iran': 'ir',
  'Iraq': 'iq',
  'Ireland': 'ie',
  'Israel': 'il',
  'Kazakhstan': 'kz',
  'Kenya': 'ke',
  'Malaysia': 'my',
  'Morocco': 'ma',
  'Nepal': 'np',
  'New Zealand': 'nz',
  'Norway': 'no',
  'Pakistan': 'pk',
  'Philippines': 'ph',
  'Poland': 'pl',
  'Portugal': 'pt',
  'Romania': 'ro',
  'Saudi Arabia': 'sa',
  'South Africa': 'za',
  'South Korea': 'kr',
  'Sweden': 'se',
  'Switzerland': 'ch',
  'Thailand': 'th',
  'United Arab Emirates': 'ae',
  'Venezuela': 've',
  'Vietnam': 'vn',
  'Egypt': 'eg',
  'Saudi Arabia': 'sa',
  'Qatar': 'qa',
  'Algeria': 'dz',
  'Tunisia': 'tn',
  'Kuwait': 'kw',
  'Bahrain': 'bh',
  'Jordan': 'jo',
  'Oman': 'om',
  'Libya': 'ly',
  'Sudan': 'sd',
  'Syria': 'sy',
  'Lebanon': 'lb',
  'Palestine': 'ps',
  'Yemen': 'ye',
  'Afghanistan': 'af',
  'Bangladesh': 'bd',
  'Bhutan': 'bt',
  'Brunei': 'bn',
  'Cambodia': 'kh',
  'Laos': 'la',
  'Maldives': 'mv',
  'Myanmar': 'mm',
  'Sri Lanka': 'lk',
  'Tajikistan': 'tj',
  'Turkmenistan': 'tm',
  'Uzbekistan': 'uz',
  'Belarus': 'by',
  'Estonia': 'ee',
  'Latvia': 'lv',
  'Lithuania': 'lt',
  'Moldova': 'md',
  'Slovakia': 'sk',
  'Slovenia': 'si',
  'Croatia': 'hr',
  'Serbia': 'rs',
  'Bosnia and Herzegovina': 'ba',
  'Macedonia': 'mk',
  'Montenegro': 'me',
  'Kosovo': 'xk',
  'Albania': 'al',
  'Georgia': 'ge',
  'Armenia': 'am',
  'Azerbaijan': 'az',
  'Cyprus': 'cy',
  'Malta': 'mt',
  'Andorra': 'ad',
  'San Marino': 'sm',
  'Monaco': 'mc',
  'Vatican City': 'va',
  'Liechtenstein': 'li',
  'Luxembourg': 'lu',
  'Singapore': 'sg',
  'Hong Kong': 'hk',
  'Macau': 'mo',
  'Mongolia': 'mn',
  'North Korea': 'kp',
  'Taiwan': 'tw',
  'Fiji': 'fj',
  'Papua New Guinea': 'pg',
  'Solomon Islands': 'sb',
  'Vanuatu': 'vu',
  'Samoa': 'ws',
  'Tonga': 'to',
  'Kiribati': 'ki',
  'Marshall Islands': 'mh',
  'Micronesia': 'fm',
  'Nauru': 'nr',
  'Palau': 'pw',
  'Tuvalu': 'tv',
  'Antigua and Barbuda': 'ag',
  'Bahamas': 'bs',
  'Barbados': 'bb',
  'Belize': 'bz',
  'Cuba': 'cu',
  'Dominica': 'dm',
  'Dominican Republic': 'do',
  'Grenada': 'gd',
  'Haiti': 'ht',
  'Jamaica': 'jm',
  'Saint Kitts and Nevis': 'kn',
  'Saint Lucia': 'lc',
  'Saint Vincent and the Grenadines': 'vc',
  'Trinidad and Tobago': 'tt',
  'Angola': 'ao',
  'Benin': 'bj',
  'Botswana': 'bw',
  'Burkina Faso': 'bf',
  'Burundi': 'bi',
  'Cape Verde': 'cv',
  'Central African Republic': 'cf',
  'Chad': 'td',
  'Comoros': 'km',
  'Democratic Republic of the Congo': 'cd',
  'Djibouti': 'dj',
  'Equatorial Guinea': 'gq',
  'Eritrea': 'er',
  'Eswatini': 'sz',
  'Ethiopia': 'et',
  'Gabon': 'ga',
  'Gambia': 'gm',
  'Ghana': 'gh',
  'Guinea': 'gn',
  'Guinea-Bissau': 'gw',
  'Ivory Coast': 'ci',
  'Lesotho': 'ls',
  'Liberia': 'lr',
  'Madagascar': 'mg',
  'Malawi': 'mw',
  'Mali': 'ml',
  'Mauritania': 'mr',
  'Mauritius': 'mu',
  'Mozambique': 'mz',
  'Namibia': 'na',
  'Niger': 'ne',
  'Nigeria': 'ng',
  'Rwanda': 'rw',
  'Senegal': 'sn',
  'Seychelles': 'sc',
  'Sierra Leone': 'sl',
  'Somalia': 'so',
  'South Sudan': 'ss',
  'Tanzania': 'tz',
  'Togo': 'tg',
  'Uganda': 'ug',
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



const messagesToDelete = {}; // Глобальное хранилище для отслеживания сообщений
const startMessagesToDelete = {};
const listMessagesToDelete = {};
const helpMessagesToDelete = {};
const resultMessagesToDelete = {};

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
            
              // Отправляем релевантные предложения, если они есть
              if (sortedOffers.length > 0) {
                sortedOffers.forEach((offer, index) => {
                  let offerMessage = `📋 *Предложение*\n\n` +
                                     `Страна: ${offer.country}\n` +
                                     `Город: ${offer.city}\n` +
                                     `Дата: ${offer.date}\n` +
                                     `Время: ${offer.time}\n` +
                                     `Сумма: ${offer.amount}\n` +
                                     `Описание: ${offer.description}\n` +
                                     `Контакт: ${offer.contact}`;
            
                  // Кнопка "Ответить"
                  const replyOptions = {
                    reply_markup: {
                      inline_keyboard: [
                        [{ text: 'Ответить', callback_data: `reply_${offer.id}` }],
                      ],
                    },
                    parse_mode: 'Markdown',
                  };
            
                  // Отправляем каждое предложение отдельно с кнопкой
                  setTimeout(() => {
                    sendAndTrackResultMessage(chatId, offerMessage, replyOptions);
                  }, index * 100); // Задержка перед отправкой каждого сообщения (чтобы сообщения шли не одновременно)
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
                      let alternativeMessage = `💡 *Альтернативное предложение*:\n\n` +
                                               `Страна: ${offer.country}\n` +
                                               `Город: ${offer.city}\n` +
                                               `Дата: ${offer.date}\n` +
                                               `Время: ${offer.time}\n` +
                                               `Сумма: ${offer.amount}\n` +
                                               `Описание: ${offer.description}\n` +
                                               `Контакт: ${offer.contact}`;
              
                      // Кнопка "Ответить"
                      const alternativeOptions = {
                        reply_markup: {
                          inline_keyboard: [
                            [{ text: 'Ответить', callback_data: `reply_${offer.id}` }],
                          ],
                        },
                        parse_mode: 'Markdown',
                      };
              
                      // Отправляем каждое альтернативное предложение отдельно с кнопкой
                      setTimeout(() => {
                        sendAndTrackResultMessage(chatId, alternativeMessage, alternativeOptions);
                      }, index * 100); // Задержка перед отправкой каждого сообщения
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
              let searchMessage = `📋 *Заявки*\n\n` +
                                 `Страна: ${offer.country}\n` +
                                 `Город: ${offer.city}\n` +
                                 `Дата: ${offer.date}\n` +
                                 `Время: ${offer.time}\n` +
                                 `Сумма: ${offer.amount}\n` +
                                 `Описание: ${offer.description}\n` +
                                 `Контакт: ${offer.contact}`;
        
              // Кнопка "Ответить"
              const replyOptions = {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: 'Ответить', callback_data: `reply_${offer.id}` }],
                  ],
                },
                parse_mode: 'Markdown',
              };
        
              // Отправляем каждое предложение отдельно с кнопкой
              setTimeout(() => {
                sendAndTrackResultMessage(chatId, searchMessage, replyOptions);
              }, index * 100); // Задержка перед отправкой каждого сообщения (чтобы сообщения шли не одновременно)
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
                  let alternativeMessage = `💡 *Альтернативное предложение*:\n\n` +
                                           `Страна: ${offer.country}\n` +
                                           `Город: ${offer.city}\n` +
                                           `Дата: ${offer.date}\n` +
                                           `Время: ${offer.time}\n` +
                                           `Сумма: ${offer.amount}\n` +
                                           `Описание: ${offer.description}\n` +
                                           `Контакт: ${offer.contact}`;
          
                  // Кнопка "Ответить"
                  const alternativeOptions = {
                    reply_markup: {
                      inline_keyboard: [
                        [{ text: 'Ответить', callback_data: `reply_${offer.id}` }],
                      ],
                    },
                    parse_mode: 'Markdown',
                  };
          
                  // Отправляем каждое альтернативное предложение отдельно с кнопкой
                  setTimeout(() => {
                    sendAndTrackResultMessage(chatId, alternativeMessage, alternativeOptions);
                  }, index * 100); // Задержка перед отправкой каждого сообщения
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

// Запуск бота
console.log("Бот запущен и готов к работе...");
