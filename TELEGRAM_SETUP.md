# 🤖 Настройка Telegram уведомлений

Полное руководство по настройке Telegram бота для получения уведомлений об ошибках тестирования сайта prokoleso.ua.

## 📋 Предварительные требования

- Telegram аккаунт
- Доступ к @BotFather в Telegram
- Права администратора в группе (если используете групповой чат)

## 🚀 Быстрая настройка

### 1. Автоматическая настройка

```bash
# Запуск интерактивной настройки
npm run telegram:setup
```

Скрипт проведет вас через весь процесс настройки:
- Создание бота
- Получение токена
- Определение chat ID
- Тестирование уведомлений

### 2. Ручная настройка

#### Шаг 1: Создание бота

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Введите имя бота (например: "Prokoleso Health Check Bot")
4. Введите username бота (например: "prokoleso_health_bot")
5. Сохраните полученный токен

#### Шаг 2: Получение Chat ID

**Для личного чата:**
1. Напишите боту любое сообщение
2. Откройте: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Найдите `"chat":{"id":123456789}` - это ваш chat ID

**Для группы:**
1. Добавьте бота в группу
2. Сделайте бота администратором
3. Напишите в группе любое сообщение
4. Откройте: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. Найдите `"chat":{"id":-123456789}` - это chat ID группы

#### Шаг 3: Настройка конфигурации

Отредактируйте файл `config/monitor.json`:

```json
{
  "notifications": {
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_BOT_TOKEN",
      "chatId": "YOUR_CHAT_ID",
      "notifyOnErrors": true,
      "notifyOnSiteDown": true,
      "notifyOnSlowPerformance": true,
      "notifyOnTestFailures": true,
      "notifyOnReports": false
    }
  }
}
```

#### Шаг 4: Создание .env файла

Создайте файл `.env` в корне проекта:

```env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_CHAT_ID
```

## 🔧 Конфигурация уведомлений

### Типы уведомлений

| Параметр | Описание | По умолчанию |
|----------|----------|--------------|
| `notifyOnErrors` | Общие ошибки системы | `true` |
| `notifyOnSiteDown` | Недоступность сайта | `true` |
| `notifyOnSlowPerformance` | Медленная загрузка | `true` |
| `notifyOnTestFailures` | Провалы тестов | `true` |
| `notifyOnReports` | Сводные отчеты | `false` |

### Дополнительные настройки

```json
{
  "notifications": {
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_BOT_TOKEN",
      "chatId": "YOUR_CHAT_ID",
      "adminChatId": "ADMIN_CHAT_ID", // Дополнительный чат для админов
      "notifyOnErrors": true,
      "notifyOnSiteDown": true,
      "notifyOnSlowPerformance": true,
      "notifyOnTestFailures": true,
      "notifyOnReports": false,
      "maxMessageLength": 4096,
      "retryAttempts": 3,
      "retryDelay": 1000
    }
  }
}
```

## 📱 Типы уведомлений

### 🚨 Ошибки тестирования

```
🚨 ОШИБКА ТЕСТИРОВАНИЯ

Тест: Проверка главной страницы
Браузер: chromium
URL: https://prokoleso.ua
Время: 2024-01-15 14:30:25

Ошибка:
TimeoutError: page.goto: Timeout 30000ms exceeded

Следующие шаги:
• Проверить доступность сайта
• Проверить логи сервера
• Запустить тесты повторно
```

### 🔴 Недоступность сайта

```
🔴 САЙТ НЕДОСТУПЕН

URL: https://prokoleso.ua
Время ответа: 30000мс
Время: 2024-01-15 14:30:25

Ошибка:
TimeoutError: Navigation timeout

Срочные действия:
• Проверить статус сервера
• Проверить DNS
• Уведомить команду разработки
```

### 🐌 Медленная производительность

```
🐌 МЕДЛЕННАЯ ЗАГРУЗКА

URL: https://prokoleso.ua
Время загрузки: 15000мс (150% от лимита)
Лимит: 10000мс
Время: 2024-01-15 14:30:25

Рекомендации:
• Проверить производительность сервера
• Оптимизировать изображения
• Проверить CDN
```

### 📊 Сводные отчеты

```
✅ ОТЧЕТ О ТЕСТИРОВАНИИ

Всего тестов: 25
✅ Прошло: 23
❌ Провалено: 2
⏭️ Пропущено: 0
📊 Успешность: 92%
⏱️ Длительность: 45с
🕐 Время: 2024-01-15 14:30:25
```

## 🧪 Тестирование уведомлений

### Проверка настройки

```bash
# Проверка статуса бота
npm run telegram:test

# Отправка тестового сообщения
node -e "
const TelegramNotifier = require('./scripts/telegram-notifier');
const notifier = new TelegramNotifier({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID
});
notifier.sendMessage('🧪 Тестовое сообщение от Prokoleso Health Check');
"
```

### Тестирование различных типов уведомлений

```bash
# Тест уведомления об ошибке
node -e "
const TelegramNotifier = require('./scripts/telegram-notifier');
const notifier = new TelegramNotifier({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID
});
notifier.sendTestError({
  testName: 'Тестовый тест',
  error: 'Тестовая ошибка',
  browser: 'chromium',
  url: 'https://prokoleso.ua'
});
"

# Тест уведомления о недоступности
node -e "
const TelegramNotifier = require('./scripts/telegram-notifier');
const notifier = new TelegramNotifier({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID
});
notifier.sendSiteDown({
  url: 'https://prokoleso.ua',
  error: 'Тестовая недоступность',
  responseTime: 30000
});
"
```

## 🔧 Устранение проблем

### Проблема: "Bot token is invalid"

**Решение:**
1. Проверьте правильность токена
2. Убедитесь, что бот создан через @BotFather
3. Проверьте, что токен не содержит лишних пробелов

### Проблема: "Chat not found"

**Решение:**
1. Убедитесь, что бот добавлен в чат
2. Проверьте правильность chat ID
3. Для групп: убедитесь, что бот является администратором

### Проблема: "Forbidden: bot was blocked by the user"

**Решение:**
1. Разблокируйте бота в Telegram
2. Напишите боту `/start`
3. Проверьте, что бот не заблокирован

### Проблема: Уведомления не приходят

**Проверьте:**
1. Статус бота: `npm run telegram:test`
2. Конфигурацию в `config/monitor.json`
3. Переменные окружения в `.env`
4. Логи в консоли при запуске тестов

## 📊 Мониторинг и логи

### Логи уведомлений

```bash
# Просмотр логов мониторинга
tail -f logs/monitor.log

# Просмотр логов тестирования
tail -f logs/test.log
```

### Статистика уведомлений

```bash
# Просмотр статистики
cat reports/telegram-stats.json
```

## 🚀 Автоматизация

### Cron задачи

```bash
# Добавьте в crontab для автоматических проверок
# Проверка каждые 5 минут
*/5 * * * * cd /path/to/project && npm run monitor

# Полная проверка каждый час
0 * * * * cd /path/to/project && npm run test:health
```

### CI/CD интеграция

```yaml
# .github/workflows/health-check.yml
name: Health Check
on:
  schedule:
    - cron: '0 */6 * * *'  # Каждые 6 часов
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:health
      - name: Notify on failure
        if: failure()
        run: |
          node -e "
          const TelegramNotifier = require('./scripts/telegram-notifier');
          const notifier = new TelegramNotifier({
            botToken: process.env.TELEGRAM_BOT_TOKEN,
            chatId: process.env.TELEGRAM_CHAT_ID
          });
          notifier.sendMessage('🚨 CI/CD: Тесты провалены в GitHub Actions');
          "
        env:
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
```

## 📞 Поддержка

Если у вас возникли проблемы с настройкой Telegram уведомлений:

1. Проверьте [FAQ](#faq)
2. Изучите логи ошибок
3. Создайте issue в репозитории
4. Обратитесь к команде разработки

---

**Сделано с ❤️ для prokoleso.ua**
