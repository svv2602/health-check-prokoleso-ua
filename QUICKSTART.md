# 🚀 Быстрый старт - Prokoleso Health Check

## Установка за 2 минуты

```bash
# 1. Переход в папку проекта
cd /home/snisar/RubyProjects/Playwright_for_prokoleso

# 2. Автоматическая установка
./scripts/setup.sh

# 3. Запуск первой проверки
npm run test:health
```

## Основные команды

```bash
# Проверка работоспособности
npm run test:health

# Все тесты
npm run test:all

# Мониторинг
npm run monitor

# Отчеты
npm run test:report
```

## Быстрые тесты

```bash
# Быстрая проверка (Chrome, без GUI)
./scripts/run-health-check.sh chromium html false

# Полная проверка (Chrome, с отчетами)
./scripts/run-health-check.sh chromium html,json false

# Визуальная проверка (с GUI)
./scripts/run-health-check.sh chromium html true
```

## Структура проекта

```
Playwright_for_prokoleso/
├── tests/                          # Тесты
│   ├── prokoleso-health-check.spec.ts    # Основные тесты
│   └── prokoleso-specific.spec.ts        # Специфичные тесты
├── scripts/                        # Скрипты
│   ├── run-health-check.sh        # Запуск тестов
│   ├── monitor.js                 # Мониторинг
│   └── setup.sh                   # Установка
├── reports/                        # Отчеты
├── config/                         # Конфигурация
└── .github/workflows/              # CI/CD
```

## Что проверяется

### ✅ Основные тесты
- Загрузка главной страницы
- Навигационное меню
- Поиск по сайту
- Контактная информация
- Мобильная версия
- Производительность
- Ошибки в консоли
- Доступность (a11y)
- Безопасность (HTTPS)

### 🔍 Специфичные тесты
- Каталог товаров
- Корзина
- Формы обратной связи
- Фильтры и сортировка
- Социальные сети
- Языковая поддержка
- Мобильная навигация
- Авторизация

## Браузеры и устройства

- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: iPhone 12, Pixel 5
- **Tablet**: iPad Pro

## Отчеты

- **HTML**: `reports/playwright-report/index.html`
- **JSON**: `reports/test-results.json`
- **Мониторинг**: `reports/monitor-report.json`

## Проблемы?

```bash
# Переустановка
npm run setup

# Очистка
npm run clean

# Отладка
npm run test:debug
```

## Помощь

```bash
# Список команд
npm run

# Алиасы
source scripts/aliases.sh
prokoleso-help
```

---
**Готово! Теперь вы можете тестировать prokoleso.ua** 🎉