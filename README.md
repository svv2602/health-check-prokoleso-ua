# Prokoleso.ua Health Check

Автоматизированная система проверки работоспособности сайта [prokoleso.ua](https://prokoleso.ua) с помощью Playwright.

## 🚀 Возможности

- **Комплексная проверка работоспособности** - тестирование всех аспектов сайта
- **Мониторинг производительности** - отслеживание времени загрузки и метрик
- **Кроссбраузерное тестирование** - Chrome, Firefox, Safari
- **Мобильное тестирование** - проверка адаптивности
- **Проверка доступности (a11y)** - соответствие стандартам доступности
- **Безопасность** - проверка HTTPS и заголовков безопасности
- **Непрерывный мониторинг** - автоматические проверки по расписанию
- **Детальная отчетность** - HTML отчеты, скриншоты, видео
- **Telegram уведомления** - мгновенные алерты об ошибках в Telegram

## 📋 Требования

- Node.js 18+ 
- npm 8+
- Playwright браузеры

## 🛠️ Установка

### Быстрая установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd Playwright_for_prokoleso

# Автоматическая установка
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Ручная установка

```bash
# Установка зависимостей
npm install

# Установка браузеров Playwright
npx playwright install

# Установка системных зависимостей
npx playwright install-deps
```

## 🎯 Использование

### Основные команды

```bash
# Запуск всех тестов (оптимизированная конфигурация)
npm run test

# Проверка работоспособности (оптимизированные тесты)
npm run test:health

# Быстрые тесты для CI/CD
npm run test:fast

# Специфичные тесты
npm run test:specific

# Все тесты
npm run test:all

# Тесты с UI
npm run test:ui

# Тесты в определенном браузере
npm run test:chrome
npm run test:firefox

# Мобильные тесты
npm run test:mobile
npm run test:tablet

# Только работающие браузеры (без WebKit)
npm run test:working

# Telegram уведомления
npm run telegram:setup
npm run telegram:test
npm run telegram:test-errors
```

### Мониторинг

```bash
# Одноразовая проверка
npm run monitor

# Непрерывный мониторинг
npm run monitor:continuous

# Просмотр отчетов
npm run test:report
```

### Скрипты

```bash
# Запуск проверки с параметрами
./scripts/run-health-check.sh [browser] [reporter] [headed]

# Примеры:
./scripts/run-health-check.sh chromium html,json false
./scripts/run-health-check.sh firefox html true
```

## 📊 Типы тестов

### 1. Health Check Tests (`tests/prokoleso-health-check.spec.ts`)

Основные тесты проверки работоспособности:

- ✅ **Загрузка главной страницы** - проверка доступности и времени загрузки
- 🧭 **Навигационное меню** - проверка работы меню и ссылок
- 🔍 **Поиск** - тестирование функции поиска
- 📞 **Контактная информация** - проверка наличия контактов
- 📱 **Мобильная версия** - тестирование адаптивности
- ⚡ **Производительность** - измерение метрик загрузки
- 🐛 **Ошибки консоли** - проверка отсутствия критических ошибок
- ♿ **Доступность** - проверка a11y стандартов
- 🔒 **Безопасность** - проверка HTTPS и заголовков

### 2. Specific Tests (`tests/prokoleso-specific.spec.ts`)

Специфичные тесты функций сайта:

- 📦 **Каталог товаров** - проверка доступности каталога
- 🛒 **Корзина** - тестирование функциональности корзины
- 📝 **Формы обратной связи** - проверка контактных форм
- 🔍 **Фильтры и сортировка** - тестирование фильтрации товаров
- 🔍 **Поиск по сайту** - расширенное тестирование поиска
- 📱 **Социальные сети** - проверка социальных ссылок
- 🌐 **Языковая поддержка** - тестирование локализации
- 📱 **Мобильная навигация** - проверка мобильного меню
- 👤 **Авторизация** - тестирование форм входа/регистрации

## 📈 Мониторинг

### Непрерывный мониторинг

```bash
# Запуск непрерывного мониторинга
npm run monitor:continuous

# Остановка: Ctrl+C
```

### Конфигурация мониторинга

Настройки в `config/monitor.json`:

```json
{
  "url": "https://prokoleso.ua",
  "timeout": 30000,
  "retries": 3,
  "interval": 300000,
  "alertThresholds": {
    "loadTime": 10000,
    "responseTime": 5000,
    "errorRate": 0.1
  }
}
```

### Алерты

Система автоматически отправляет уведомления при:

- Недоступности сайта
- Медленной загрузке (>10 сек)
- Медленном ответе сервера (>5 сек)
- Низкой успешности (<90%)

### Telegram уведомления

Настройка Telegram бота для получения уведомлений об ошибках:

```bash
# Настройка Telegram бота
npm run telegram:setup

# Тестирование уведомлений
npm run telegram:test
```

#### Типы уведомлений:

- 🚨 **Ошибки тестирования** - при провале тестов
- 🔴 **Недоступность сайта** - при ошибках загрузки
- 🐌 **Медленная производительность** - при превышении лимитов
- 📊 **Сводные отчеты** - результаты тестирования
- 📸 **Скриншоты ошибок** - автоматическая отправка
- 📁 **Trace файлы** - для отладки

#### Настройка бота:

1. Создайте бота через @BotFather в Telegram
2. Получите токен бота
3. Добавьте бота в группу или получите chat ID
4. Запустите `npm run telegram:setup`
5. Следуйте инструкциям настройки

## 📊 Отчеты

### HTML отчеты

```bash
# Просмотр HTML отчета
npm run test:report

# Открытие в браузере
open reports/playwright-report/index.html
```

### JSON отчеты

```bash
# JSON отчет
cat reports/test-results.json

# Отчет мониторинга
cat reports/monitor-report.json
```

### Структура отчетов

```
reports/
├── playwright-report/          # HTML отчеты
├── test-results.json          # JSON результаты
├── test-results.xml          # JUnit результаты
├── monitor-report.json       # Отчет мониторинга
└── alerts.log               # Лог алертов
```

## 🔧 Конфигурация

### Playwright конфигурация

Основные настройки в `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'https://prokoleso.ua',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
});
```

### Переменные окружения

Создайте файл `.env`:

```env
PROKOLESO_URL=https://prokoleso.ua
MONITOR_INTERVAL=300000
ALERT_EMAIL=admin@prokoleso.ua
HEADLESS=true
TIMEOUT=30000
```

## 🚀 CI/CD

### GitHub Actions

Автоматические проверки настроены в `.github/workflows/`:

- **health-check.yml** - основные проверки (каждые 6 часов)
- **monitor.yml** - непрерывный мониторинг (каждые 15 минут)

### Ручной запуск

```bash
# Запуск через GitHub Actions
gh workflow run health-check.yml

# С параметрами
gh workflow run health-check.yml -f test_type=all -f browser=chromium
```

## 📱 Мобильное тестирование

### Тестирование на мобильных устройствах

```bash
# Мобильные тесты
npm run test:mobile

# Планшетные тесты  
npm run test:tablet
```

### Поддерживаемые устройства

- iPhone 12, iPhone 13, iPhone 14
- Pixel 5, Pixel 6
- iPad, iPad Pro
- Samsung Galaxy S21

## 🔍 Отладка

### Запуск в режиме отладки

```bash
# Отладочный режим
npm run test:debug

# С GUI
npm run test:ui

# С видимым браузером
npm run test:headed
```

### Логирование

```bash
# Подробные логи
DEBUG=pw:api npm run test:health

# Логи Playwright
PLAYWRIGHT_DEBUG=1 npm run test:health
```

## 🛠️ Разработка

### Добавление новых тестов

1. Создайте файл в папке `tests/`
2. Используйте стандартную структуру:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Новые тесты', () => {
  test('Новый тест', async ({ page }) => {
    await page.goto('https://prokoleso.ua');
    // Ваши проверки
  });
});
```

### Кастомные селекторы

```typescript
// Поиск элементов
const element = page.locator('selector');

// Ожидание элементов
await page.waitForSelector('selector');

// Проверка видимости
await expect(element).toBeVisible();
```

## 📞 Поддержка

### Полезные команды

```bash
# Очистка результатов
npm run clean

# Переустановка
npm run setup

# Проверка версий
npx playwright --version
```

### Решение проблем

1. **Ошибки установки браузеров**:
   ```bash
   npx playwright install --force
   ```

2. **Проблемы с зависимостями**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Ошибки тестов**:
   ```bash
   npm run test:debug
   ```

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature ветку
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📧 Контакты

- **Проект**: Prokoleso Health Check
- **Автор**: Health Check Team
- **Email**: support@prokoleso.ua

---

**Сделано с ❤️ для prokoleso.ua**