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
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id; 
  const username = msg.from.username || `${msg.from.first_name} ${msg.from.last_name}`;
  const message = `Аккаунт успешно создан для ${username}.`;
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
  bot.sendMessage(chatId, message, options);
});



// ---------------------------------------------
// ОБРАБОТКА СООБЩЕНИЙ ОТ ПОЛЬЗОВАТЕЛЯ
// ---------------------------------------------

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userId = msg.from.id;

  if (text === 'Ищу услугу') {
    // Логика запускается при выборе "Ищу услугу"
    states[chatId] = { step: 'search_1', responses: {} };
    bot.sendMessage(chatId, 'В какой стране вы хотите найти услугу?');
  } else if (text === 'Предоставляю услугу') {
    // Логика запускается при выборе "Предоставляю услугу"
    states[chatId] = { step: 'provide_1', responses: {} };
    bot.sendMessage(chatId, 'В какой стране вы хотите предоставить услугу?');
  } else if (text === 'Мои заявки') {
    // Логика получения заявок пользователя
    const searchRequests = db.getSearchRequestsByUser(userId);
    const offerRequests = db.getOfferRequestsByUser(userId);
  
    let message = 'Ваши заявки:\n\n';
  
    if (searchRequests.length > 0) {
      message += '🔍 **Поиск услуг**:\n';
      searchRequests.forEach((req, index) => {
        message += `${index + 1}. ${req.country}, ${req.city}, ${req.date}, ${req.time}, ${req.amount} - ${req.description}\n`;
      });
    }
  
    if (offerRequests.length > 0) {
      message += '\n💼 **Предоставление услуг**:\n';
      offerRequests.forEach((req, index) => {
        message += `${index + 1}. ${req.country}, ${req.city}, ${req.date}, ${req.time}, ${req.amount} - ${req.description}\n`;
      });
    }
  
    if (searchRequests.length === 0 && offerRequests.length === 0) {
      message = 'У вас нет активных заявок.';
    }
  
    bot.sendMessage(chatId, message);

  } else {
    if (states[chatId]) {
      const userState = states[chatId];
      if (userState.step.startsWith('search')) {
        handleSearchService(chatId, text, userState, userId);
      } else if (userState.step.startsWith('provide')) {
        handleProvideService(chatId, text, userState);
      }
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
        bot.sendMessage(chatId, `Страна выбрана: ${bestMatchCountry}. Укажите город:`);
      } else {
        bot.sendMessage(chatId, 'Не могу найти страну с таким названием. Попробуйте снова.');
      }
      break;
    
      case 'search_2':

      userState.responses.city = text;
      userState.step = 'search_3';
      bot.sendMessage(chatId, 'Укажите дату, когда вам нужна услуга (например, 01/10/2023):');
      break;


    case 'search_3':
  if (!dateRegex.test(text)) {
    bot.sendMessage(chatId, 'Неверный формат даты. Укажите дату в формате DD/MM/YYYY (например, 01/10/2023).');
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
        bot.sendMessage(chatId, 'Дата не может быть в прошлом. Укажите сегодняшнюю или будущую дату.');
      } else if (inputDate > maxDate) {
        bot.sendMessage(chatId, 'Дата не может быть позже, чем через 7 дней от сегодняшнего дня.');
      } else {
        userState.responses.date = text;
        userState.step = 'search_4';
        bot.sendMessage(chatId, 'Укажите время, когда вам нужна услуга (например, 14.30-15.30):');
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
        bot.sendMessage(chatId, 'Введено нереальное время. Убедитесь, что часы от 00 до 23, а минуты — от 00 до 59.');
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
          bot.sendMessage(
            chatId,
            `Начальное время услуги не может быть меньше или равно текущему времени (${currentHour}.${currentMinute}). Укажите время больше текущего времени.`
          );
          break;
        }
      }
  
  
      // Если время корректно, сохраняем его и переходим к следующему шагу
      userState.responses.time = text;
      userState.step = 'search_5';
      bot.sendMessage(chatId, 'Укажите сумму (например, 5000):');
    } else {
      // Сообщение об ошибке формата
      bot.sendMessage(chatId, 'Неверный формат времени. Укажите время в формате HH.MM-HH.MM (например, 14.30-15.30).');
    }
    break;
  

    case 'search_5':
      userState.responses.amount = text;
      userState.step = 'search_6';
      bot.sendMessage(chatId, 'Опишите, какую услугу вы ищете:');
      break;

    case 'search_6':
      userState.responses.description = text;
      const searchSummary = `Поиск услуги завершен!\n\nСтрана: ${userState.responses.country}\nГород: ${userState.responses.city}\nДата: ${userState.responses.date}\nВремя: ${userState.responses.time}\nСумма: ${userState.responses.amount}\nОписание: ${userState.responses.description}`;
      
      const { country, city, date, time, amount, description } = userState.responses;
      db.addSearchRequest(userId, country, city, date, time, amount, description);

      bot.sendMessage(chatId, searchSummary);
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
        bot.sendMessage(chatId, `Страна выбрана: ${bestMatchCountry}. Укажите город:`);
      } else {
        bot.sendMessage(chatId, 'Не могу найти страну с таким названием. Попробуйте снова.');
      }
      break;
    
      case 'provide_2':

      userState.responses.city = text;
      userState.step = 'provide_3';
      bot.sendMessage(chatId, 'Укажите дату, когда вам нужна услуга (например, 01/10/2023):');
      break;


    case 'provide_3':
  if (!dateRegex.test(text)) {
    bot.sendMessage(chatId, 'Неверный формат даты. Укажите дату в формате DD/MM/YYYY (например, 01/10/2023).');
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
        bot.sendMessage(chatId, 'Дата не может быть в прошлом. Укажите сегодняшнюю или будущую дату.');
      } else if (inputDate > maxDate) {
        bot.sendMessage(chatId, 'Дата не может быть позже, чем через 7 дней от сегодняшнего дня.');
      } else {
        userState.responses.date = text;
        userState.step = 'provide_4';
        bot.sendMessage(chatId, 'Укажите время, когда вам нужна услуга (например, 14.30-15.30):');
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
          bot.sendMessage(chatId, 'Введено нереальное время. Убедитесь, что часы от 00 до 23, а минуты — от 00 до 59.');
        } else {
          // Если время корректно, сохраняем его и переходим к следующему шагу
          userState.responses.time = text;
          userState.step = 'provide_5';
          bot.sendMessage(chatId, 'Укажите сумму (например, 5000):');
        }
      } else {
        // Сообщение об ошибке формата
        bot.sendMessage(chatId, 'Неверный формат времени. Укажите время в формате HH.MM-HH.MM (например, 14.30-15.30).');
      }
    
      break;

    case 'provide_5':
      userState.responses.amount = text;
      userState.step = 'provide_6';
      bot.sendMessage(chatId, 'Опишите, какую услугу вы ищете:');
      break;

    case 'provide_6':
      userState.responses.description = text;
      const searchSummary = `Заявка завершен!\n\nСтрана: ${userState.responses.country}\nГород: ${userState.responses.city}\nДата: ${userState.responses.date}\nВремя: ${userState.responses.time}\nСумма: ${userState.responses.amount}\nОписание: ${userState.responses.description}`;
      
      const { country, city, date, time, amount, description } = userState.responses;
      db.addOfferRequest(userId, country, city, date, time, amount, description);
      
      bot.sendMessage(chatId, searchSummary);
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
