from telegram import Update, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ConversationHandler, ContextTypes, filters
import logging
from datetime import datetime, timedelta
import asyncio
from fuzzywuzzy import process

# Ваш токен, полученный от BotFather
TELEGRAM_TOKEN = '8083887592:AAGT_8XTHSgSPwbjc7hC8kRLner6v9ZJx2E'

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Этапы заявки
ASK_CITY, ASK_DATE, ASK_TIME, ASK_AMOUNT, ASK_PAYMENT_METHOD, ASK_TIMER, ASK_DESCRIPTION = range(7)

# Списки для хранения заявок
searching_users = []
providing_users = []

# Словарь для хранения рейтинга и заявок пользователей
user_data = {}

# Хранение идентификаторов сообщений для удаления
previous_messages = {}
active_requests = {}

# Локализация сообщений
def get_message(key, language):
    messages = {
        'welcome': {
            'en': 'Welcome, {name}!\nYour current rating: {rating}/10\n\nChoose one of the options below:',
            'ru': 'Добро пожаловать, {name}!\nВаш текущий рейтинг: {rating}/10\n\nВыберите один из вариантов ниже:',
            'es': '¡Bienvenido, {name}!\nSu calificación actual: {rating}/10\n\nElija una de las opciones a continuación:'
        },
        'enter_city': {
            'en': 'Enter the city (please make sure the spelling is correct):',
            'ru': 'Введите город (пожалуйста, убедитесь в правильности написания):',
            'es': 'Ingrese la ciudad (asegúrese de que la ortografía sea correcta):'
        },
        'enter_date': {
            'en': 'Enter the date of service (e.g., 02/05/2024):',
            'ru': 'Введите дату услуги (например, 02/05/2024):',
            'es': 'Ingrese la fecha del servicio (por ejemplo, 02/05/2024):'
        },
        'enter_time': {
            'en': 'Enter the time of service (e.g., 12.00-14.00):',
            'ru': 'Введите время услуги (например, 12.00-14.00):',
            'es': 'Ingrese la hora del servicio (por ejemplo, 12.00-14.00):'
        },
        'enter_amount': {
            'en': 'Enter the amount of payment (e.g., 100 USD, 100 EUR, 100 RUB, or Contractual):',
            'ru': 'Введите сумму оплаты (например, 100 USD, 100 EUR, 100 RUB, или Договорная):',
            'es': 'Ingrese el monto del pago (por ejemplo, 100 USD, 100 EUR, 100 RUB o Contractual):'
        },
        'enter_payment_method': {
            'en': 'Enter the payment method (e.g., Card, Cash, Cryptocurrency):',
            'ru': 'Введите метод оплаты (например, Карта, Наличные, Криптовалюта):',
            'es': 'Ingrese el método de pago (por ejemplo, Tarjeta, Efectivo, Criptomoneda):'
        },
        'enter_timer': {
            'en': 'Enter the timer in hours (1-24). This is the time the request will remain active before being deleted:',
            'ru': 'Введите таймер в часах (1-24). Это время, в течение которого заявка будет активна перед удалением:',
            'es': 'Ingrese el temporizador en horas (1-24). Este es el tiempo que la solicitud permanecerá activa antes de ser eliminada:'
        },
        'enter_description': {
            'en': 'Enter the description of the service (e.g., walking the dog, any description will match all required services):',
            'ru': 'Введите описание услуги (например, выгулять собаку, любое описание подойдет ко всем требуемым услугам):',
            'es': 'Ingrese la descripción del servicio (por ejemplo, pasear al perro, cualquier descripción coincidirá con todos los servicios requeridos):'
        },
        'request_complete': {
            'en': 'Request completed!\n\nCity: {city}\nDate of service: {date}\nTime of service: {time}\nAmount of payment: {amount}\nPayment method: {payment_method}\nTimer: {timer}\nDescription: {description}',
            'ru': 'Заявка завершена!\n\nГород: {city}\nДата услуги: {date}\nВремя услуги: {time}\nСумма оплаты: {amount}\nМетод оплаты: {payment_method}\nТаймер: {timer}\nОписание: {description}',
            'es': '¡Solicitud completada!\n\nCiudad: {city}\nFecha del servicio: {date}\nHora del servicio: {time}\nMonto del pago: {amount}\nMétodo de pago: {payment_method}\nTemporizador: {timer}\nDescripción: {description}'
        },
        'no_exact_matches': {
            'en': 'No exact matches found.',
            'ru': 'Точных совпадений не найдено.',
            'es': 'No se encontraron coincidencias exactas.'
        },
        'exact_matches': {
            'en': 'Exact matches found:\n',
            'ru': 'Найдены точные совпадения:\n',
            'es': 'Se encontraron coincidencias exactas:\n'
        },
        'partial_matches': {
            'en': 'Partial matches found:\n',
            'ru': 'Найдены частичные совпадения:\n',
            'es': 'Se encontraron coincidencias parciales:\n'
        },
        'no_requests': {
            'en': 'You have no active requests.',
            'ru': 'У вас нет активных заявок.',
            'es': 'No tienes solicitudes activas.'
        },
        'my_requests': {
            'en': 'Your active requests:\n',
            'ru': 'Ваши активные заявки:\n',
            'es': 'Sus solicitudes activas:\n'
        },
        'delete_request_prompt': {
            'en': '\nTo delete a request, use the command /delete_request <number>',
            'ru': '\nДля удаления заявки используйте команду /delete_request <номер>',
            'es': '\nPara eliminar una solicitud, use el comando /delete_request <número>'
        },
        'request_deleted': {
            'en': 'Request successfully deleted.',
            'ru': 'Заявка успешно удалена.',
            'es': 'Solicitud eliminada con éxito.'
        },
        'request_not_found': {
            'en': 'Request with the specified number not found.',
            'ru': 'Заявка с указанным номером не найдена.',
            'es': 'No se encontró la solicitud con el número especificado.'
        },
        'invalid_request_number': {
            'en': 'Please provide a valid request number.',
            'ru': 'Пожалуйста, укажите правильный номер заявки.',
            'es': 'Por favor proporcione un número de solicitud válido.'
        },
        'invalid_date': {
            'en': 'Invalid date format. Please enter the date in the format DD/MM/YYYY (e.g., 02/05/2024).',
            'ru': 'Неверный формат даты. Пожалуйста, введите дату в формате ДД/ММ/ГГГГ (например, 02/05/2024).',
            'es': 'Formato de fecha no válido. Ingrese la fecha en el formato DD/MM/AAAA (por ejemplo, 02/05/2024).'
        },
        'invalid_time': {
            'en': 'Invalid time format. Please enter the time in the format HH.MM-HH.MM (e.g., 12.00-14.00).',
            'ru': 'Неверный формат времени. Пожалуйста, введите время в формате ЧЧ.ММ-ЧЧ.ММ (например, 12.00-14.00).',
            'es': 'Formato de tiempo no válido. Ingrese la hora en el formato HH.MM-HH.MM (por ejemplo, 12.00-14.00).'
        },
        'invalid_amount': {
            'en': 'Invalid amount format. Please enter a number.',
            'ru': 'Неверный формат суммы. Пожалуйста, введите число.',
            'es': 'Formato de cantidad no válido. Ingrese un número.'
        },
        'invalid_timer': {
            'en': 'Invalid timer format. Please enter a number of hours (1-24).',
            'ru': 'Неверный формат таймера. Пожалуйста, введите количество часов (1-24).',
            'es': 'Formato de temporizador no válido. Ingrese una cantidad de horas (1-24).'
        },
        'request_cancelled': {
            'en': 'Request cancelled.',
            'ru': 'Заявка отменена.',
            'es': 'Solicitud cancelada.'
        },
        'help_message': {
            'en': 'Bot commands: /start, /help, /my_requests\n\nExample of filling out a request:\nCity: Berlin\nDate of service: 02/05/2024\nTime of service: 12.00-14.00\nAmount of payment: 30 Euros\nTimer: 1 hour\nDescription of the service: Walking the dog\n\nFor support, contact: support@example.com\n\nUser Agreement: The bot is not responsible for transactions made between users and serves only as a bulletin board.',
            'ru': 'Команды бота: /start, /help, /my_requests\n\nПример заполнения заявки:\nГород: Берлин\nДата услуги: 02/05/2024\nВремя услуги: 12.00-14.00\nСумма оплаты: 30 Евро\nТаймер: 1 час\nОписание услуги: Выгулять собаку\n\nДля поддержки свяжитесь с: support@example.com\n\nПользовательское соглашение: Бот не несет ответственности за сделки, совершенные между пользователями, и является просто доской объявлений.',
            'es': 'Comandos del bot: /start, /help, /my_requests\n\nEjemplo de cómo completar una solicitud:\nCiudad: Berlín\nFecha del servicio: 02/05/2024\nHora del servicio: 12.00-14.00\nMonto del pago: 30 Euros\nTemporizador: 1 hora\nDescripción del servicio: Pasear al perro\n\nPara soporte, contacte: support@example.com\n\nAcuerdo de usuario: El bot no es responsable de las transacciones realizadas entre los usuarios y sirve solo como un tablero de anuncios.'
        }
    }
    return messages[key].get(language, messages[key]['en'])

# Функция для удаления предыдущих сообщений
async def delete_previous_messages(context: ContextTypes.DEFAULT_TYPE, chat_id: int):
    if chat_id in previous_messages:
        for message_id in previous_messages[chat_id]:
            try:
                await context.bot.delete_message(chat_id=chat_id, message_id=message_id)
            except Exception as e:
                logger.error(f"Ошибка при удалении сообщения: {e}")
        previous_messages[chat_id] = []

# Функция для добавления сообщения в список для удаления
def add_message_to_delete(chat_id, message_id):
    if chat_id in previous_messages:
        previous_messages[chat_id].append(message_id)
    else:
        previous_messages[chat_id] = [message_id]

# Функция для проверки лимита заявок
def check_request_limit(user_id):
    user_info = user_data.get(user_id, {'requests_today': 0, 'rating': 0, 'total_requests': 0})
    if user_info['rating'] >= 9:
        return True  # No limit for users with rating >= 9
    elif user_info['rating'] >= 7 and user_info['total_requests'] >= 100:
        return user_info['requests_today'] < 50  # 50 requests limit for advanced users
    else:
        return user_info['requests_today'] < 10  # 10 requests limit for new users

# Команда /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    chat_id = update.message.chat_id
    user_id = user.id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    # Удаление предыдущих сообщений
    await delete_previous_messages(context, chat_id)

    if user:
        logger.info(f"Получена команда /start от {user.first_name} ({user.id})")

        # Инициализация данных пользователя
        if user_id not in user_data:
            user_data[user_id] = {'requests_today': 0, 'rating': 0, 'total_requests': 0}

        user_info = user_data[user_id]

        # Создаем клавиатуру с локализованными кнопками
        keyboard = [
            [KeyboardButton("Ищу услугу"), KeyboardButton("Предоставляю услугу")],
            [KeyboardButton("/start"), KeyboardButton("/help")],
            [KeyboardButton("Мои заявки")]
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True, one_time_keyboard=False)

        # Отправляем приветственное сообщение с кнопками
        message = await context.bot.send_message(
            chat_id,
            get_message('welcome', language).format(name=user.first_name, rating=user_info['rating']),
            reply_markup=reply_markup
        )
        add_message_to_delete(chat_id, message.message_id)
    else:
        logger.error("Нет пользователя в обновлении")

# Команда /help
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    chat_id = update.message.chat_id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'
    
    await delete_previous_messages(context, chat_id)

    message = await context.bot.send_message(
        chat_id,
        get_message('help_message', language)
    )
    add_message_to_delete(chat_id, message.message_id)

# Команда /my_requests для отображения активных заявок
async def my_requests(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    chat_id = update.message.chat_id
    user_id = user.id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    await delete_previous_messages(context, chat_id)

    requests = active_requests.get(user_id, [])
    if requests:
        message_text = get_message('my_requests', language)
        for idx, req in enumerate(requests):
            message_text += f"{idx+1}. {req['city']}, {req['date']}, {req['time']}, {req['amount']}, {req['payment_method']}, {req['description']}\n"
        message_text += get_message('delete_request_prompt', language)
    else:
        message_text = get_message('no_requests', language)

    message = await context.bot.send_message(chat_id, message_text)
    add_message_to_delete(chat_id, message.message_id)

# Команда /delete_request для удаления активной заявки
async def delete_request(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    chat_id = update.message.chat_id
    user_id = user.id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'
    args = context.args

    if not args:
        message = await context.bot.send_message(chat_id, get_message('invalid_request_number', language))
        add_message_to_delete(chat_id, message.message_id)
        return

    try:
        request_index = int(args[0]) - 1
        if user_id in active_requests and 0 <= request_index < len(active_requests[user_id]):
            removed_request = active_requests[user_id].pop(request_index)
            if removed_request['type'] == 'search':
                searching_users.remove(removed_request)
            else:
                providing_users.remove(removed_request)
            message = await context.bot.send_message(chat_id, get_message('request_deleted', language))
            add_message_to_delete(chat_id, message.message_id)
        else:
            message = await context.bot.send_message(chat_id, get_message('request_not_found', language))
            add_message_to_delete(chat_id, message.message_id)
    except ValueError:
        message = await context.bot.send_message(chat_id, get_message('invalid_request_number', language))
        add_message_to_delete(chat_id, message.message_id)

# Нормализация названия города
def normalize_city_name(city_name):
    city_name = city_name.lower().strip()
    known_cities = {
        "питер": "Санкт-Петербург",
        "петербург": "Санкт-Петербург",
        "санкт-петербург": "Санкт-Петербург",
        "москва": "Москва",
        "мск": "Москва"
        # Добавьте сюда другие известные города и их варианты написания
    }
    return known_cities.get(city_name, city_name)

# Начало заявки для поиска услуги
async def search_service(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    user_id = user.id
    chat_id = update.message.chat_id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    if not check_request_limit(user_id):
        message = await context.bot.send_message(chat_id, "You have reached your daily request limit.")
        add_message_to_delete(chat_id, message.message_id)
        return ConversationHandler.END

    await delete_previous_messages(context, chat_id)

    message = await context.bot.send_message(chat_id, get_message('enter_city', language))
    add_message_to_delete(chat_id, message.message_id)
    context.user_data['type'] = 'search'
    return ASK_CITY

# Начало заявки для предоставления услуги
async def provide_service(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    user_id = user.id
    chat_id = update.message.chat_id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    if not check_request_limit(user_id):
        message = await context.bot.send_message(chat_id, "You have reached your daily request limit.")
        add_message_to_delete(chat_id, message.message_id)
        return ConversationHandler.END

    await delete_previous_messages(context, chat_id)

    message = await context.bot.send_message(chat_id, get_message('enter_city', language))
    add_message_to_delete(chat_id, message.message_id)
    context.user_data['type'] = 'provide'
    return ASK_CITY

# Проверка пустого значения и обработка ответа на вопрос о городе
async def ask_city(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    chat_id = update.message.chat_id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    city_text = update.message.text
    if city_text.strip():
        normalized_city = normalize_city_name(city_text)
        context.user_data['city'] = normalized_city
        message = await context.bot.send_message(chat_id, get_message('enter_date', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_DATE
    else:
        message = await context.bot.send_message(chat_id, get_message('enter_city', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_CITY

# Обработка ответа на вопрос о дате
async def ask_date(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    chat_id = update.message.chat_id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    date_text = update.message.text
    try:
        datetime.strptime(date_text, "%d/%m/%Y")
        context.user_data['date'] = date_text
        message = await context.bot.send_message(chat_id, get_message('enter_time', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_TIME
    except ValueError:
        message = await context.bot.send_message(chat_id, get_message('invalid_date', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_DATE

# Обработка ответа на вопрос о времени
async def ask_time(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    chat_id = update.message.chat_id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    time_text = update.message.text
    if "-" in time_text and len(time_text.split("-")) == 2:
        start_time, end_time = time_text.split("-")
        try:
            datetime.strptime(start_time.strip(), "%H.%M")
            datetime.strptime(end_time.strip(), "%H.%M")
            context.user_data['time'] = time_text
            message = await context.bot.send_message(chat_id, get_message('enter_amount', language))
            add_message_to_delete(chat_id, message.message_id)
            return ASK_AMOUNT
        except ValueError:
            message = await context.bot.send_message(chat_id, get_message('invalid_time', language))
            add_message_to_delete(chat_id, message.message_id)
            return ASK_TIME
    else:
        message = await context.bot.send_message(chat_id, get_message('invalid_time', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_TIME

# Обработка ответа на вопрос о сумме
async def ask_amount(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    chat_id = update.message.chat_id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    if update.message.text.strip():
        context.user_data['amount'] = update.message.text
        message = await context.bot.send_message(chat_id, get_message('enter_payment_method', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_PAYMENT_METHOD
    else:
        message = await context.bot.send_message(chat_id, get_message('enter_amount', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_AMOUNT

# Обработка ответа на вопрос о методе оплаты
async def ask_payment_method(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    chat_id = update.message.chat_id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    if update.message.text.strip():
        context.user_data['payment_method'] = update.message.text
        message = await context.bot.send_message(chat_id, get_message('enter_timer', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_TIMER
    else:
        message = await context.bot.send_message(chat_id, get_message('enter_payment_method', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_PAYMENT_METHOD

# Обработка ответа на вопрос о таймере
async def ask_timer(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    chat_id = update.message.chat_id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    timer_text = update.message.text
    try:
        hours = int(timer_text)
        if 1 <= hours <= 24:
            expiry_time = datetime.now() + timedelta(hours=hours)
            context.user_data['timer'] = timer_text
            context.user_data['expiry_time'] = expiry_time
            message = await context.bot.send_message(chat_id, get_message('enter_description', language))
            add_message_to_delete(chat_id, message.message_id)
            return ASK_DESCRIPTION
        else:
            raise ValueError
    except ValueError:
        message = await context.bot.send_message(chat_id, get_message('invalid_timer', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_TIMER

# Обработка ответа на вопрос об описании
async def ask_description(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    chat_id = update.message.chat_id
    user_id = user.id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'

    if update.message.text.strip():
        context.user_data['description'] = update.message.text

        # Здесь вы можете обработать собранные данные
        request_data = context.user_data
        request_data['chat_id'] = chat_id

        if user_id not in active_requests:
            active_requests[user_id] = []
        active_requests[user_id].append(request_data)

        if user_id not in user_data:
            user_data[user_id] = {'requests_today': 0, 'rating': 0, 'total_requests': 0}
        user_data[user_id]['requests_today'] += 1
        user_data[user_id]['total_requests'] += 1

        if request_data['type'] == 'search':
            searching_users.append(request_data)
        else:
            providing_users.append(request_data)

        message = await context.bot.send_message(
            chat_id,
            get_message('request_complete', language).format(
                city=request_data['city'], date=request_data['date'], time=request_data['time'],
                amount=request_data['amount'], payment_method=request_data['payment_method'],
                timer=request_data['timer'], description=request_data['description']
            )
        )
        add_message_to_delete(chat_id, message.message_id)

        # Поиск совпадений
        exact_matches, partial_matches = find_matches(request_data)
        search_result = ""

        if exact_matches:
            match_message = get_message('exact_matches', language)
            for match in exact_matches:
                match_message += f"{match['city']}, {match['date']}, {match['time']}, {match['amount']}, {match['payment_method']}, {match['description']}\n"
            search_result += match_message
        else:
            search_result += get_message('no_exact_matches', language)

        if partial_matches:
            partial_match_message = get_message('partial_matches', language)
            for partial_match in partial_matches:
                partial_match_message += f"{partial_match['city']}, {partial_match['date']}, {partial_match['time']}, {partial_match['amount']}, {partial_match['payment_method']}, {partial_match['description']}\n"
            search_result += partial_match_message

        result_message = await context.bot.send_message(chat_id, search_result)
        add_message_to_delete(chat_id, result_message.message_id)

        # Удаление заявки по истечении таймера
        asyncio.create_task(schedule_removal(context, request_data))

        # Отображение клавиатуры снова
        keyboard = [
            [KeyboardButton("Ищу услугу"), KeyboardButton("Предоставляю услугу")],
            [KeyboardButton("/start"), KeyboardButton("/help")],
            [KeyboardButton("Мои заявки")]
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True, one_time_keyboard=False)

        message = await context.bot.send_message(chat_id, get_message('welcome', language).format(name=user.first_name, rating=user_data[user_id]['rating']), reply_markup=reply_markup)
        add_message_to_delete(chat_id, message.message_id)

        return ConversationHandler.END
    else:
        message = await context.bot.send_message(chat_id, get_message('enter_description', language))
        add_message_to_delete(chat_id, message.message_id)
        return ASK_DESCRIPTION

def find_matches(user_data):
    exact_matches = []
    partial_matches = []
    if user_data['type'] == 'search':
        for provider in providing_users:
            if (provider['city'].lower() == user_data['city'].lower() and
                provider['date'].lower() == user_data['date'].lower() and
                provider['time'].lower() == user_data['time'].lower() and
                provider['amount'].lower() == user_data['amount'].lower() and
                provider['payment_method'].lower() == user_data['payment_method'].lower() and
                provider['description'].lower() == user_data['description'].lower()):
                exact_matches.append(provider)
            else:
                partial_matches.append(provider)
    else:
        for seeker in searching_users:
            if (seeker['city'].lower() == user_data['city'].lower() and
                seeker['date'].lower() == user_data['date'].lower() and
                seeker['time'].lower() == user_data['time'].lower() and
                seeker['amount'].lower() == user_data['amount'].lower() and
                seeker['payment_method'].lower() == user_data['payment_method'].lower() and
                seeker['description'].lower() == user_data['description'].lower()):
                exact_matches.append(seeker)
            else:
                partial_matches.append(seeker)
    return exact_matches, partial_matches

async def schedule_removal(context: ContextTypes.DEFAULT_TYPE, user_data):
    expiry_time = user_data['expiry_time']
    now = datetime.now()
    delay = (expiry_time - now).total_seconds()
    await asyncio.sleep(delay)

    if user_data['type'] == 'search':
        searching_users.remove(user_data)
    else:
        providing_users.remove(user_data)
    
    chat_id = user_data['chat_id']
    active_requests[user_data['chat_id']].remove(user_data)
    logger.info(f"Заявка удалена по истечении таймера: {user_data}")

# Отмена заявки
async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = update.effective_user
    chat_id = update.message.chat_id
    language = user.language_code if user.language_code in ['en', 'ru', 'es'] else 'en'
    
    await delete_previous_messages(context, chat_id)

    message = await context.bot.send_message(chat_id, get_message('request_cancelled', language))
    add_message_to_delete(chat_id, message.message_id)
    return ConversationHandler.END

def main() -> None:
    application = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    
    start_handler = CommandHandler("start", start)
    help_handler = CommandHandler("help", help_command)
    my_requests_handler = CommandHandler("my_requests", my_requests)
    delete_request_handler = CommandHandler("delete_request", delete_request)
    
    conv_handler_search = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex('^Ищу услугу$'), search_service)],
        states={
            ASK_CITY: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_city)],
            ASK_DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_date)],
            ASK_TIME: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_time)],
            ASK_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_amount)],
            ASK_PAYMENT_METHOD: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_payment_method)],
            ASK_TIMER: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_timer)],
            ASK_DESCRIPTION: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_description)],
        },
        fallbacks=[CommandHandler('cancel', cancel)],
    )

    conv_handler_provide = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex('^Предоставляю услугу$'), provide_service)],
        states={
            ASK_CITY: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_city)],
            ASK_DATE: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_date)],
            ASK_TIME: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_time)],
            ASK_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_amount)],
            ASK_PAYMENT_METHOD: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_payment_method)],
            ASK_TIMER: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_timer)],
            ASK_DESCRIPTION: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_description)],
        },
        fallbacks=[CommandHandler('cancel', cancel)],
    )

    application.add_handler(start_handler)
    application.add_handler(help_handler)
    application.add_handler(my_requests_handler)
    application.add_handler(delete_request_handler)
    application.add_handler(conv_handler_search)
    application.add_handler(conv_handler_provide)

    logger.info("Запуск бота")
    application.run_polling()
    logger.info("Бот остановлен")

if __name__ == '__main__':
    main()
