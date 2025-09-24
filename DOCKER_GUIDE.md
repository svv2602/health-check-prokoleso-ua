# 🐳 Docker Guide для Playwright тестов

Руководство по использованию Docker для запуска Playwright тестов Prokoleso.ua.

## 📋 Требования

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 2GB+ свободного места

## 🚀 Быстрый старт

### 1. Сборка образа
```bash
# Автоматическая сборка
npm run docker:build

# Или вручную
docker-compose build
```

### 2. Запуск тестов
```bash
# Быстрые тесты
npm run docker:fast

# Полные тесты
npm run docker:full

# Мониторинг
npm run docker:monitor
```

## 🐳 Docker команды

### Основные команды
```bash
# Сборка образа
npm run docker:build

# Быстрые тесты
npm run docker:fast

# Полные тесты  
npm run docker:full

# Мониторинг
npm run docker:monitor

# Режим разработки
npm run docker:dev

# Очистка
npm run docker:clean
```

### Продвинутые команды
```bash
# Запуск с опциями
./scripts/docker-run.sh fast --build --detach

# Просмотр логов
./scripts/docker-run.sh monitor --logs

# Справка
./scripts/docker-run.sh --help
```

## 📊 Сервисы

### 1. playwright-tests (Основной)
- **Назначение**: Быстрые тесты
- **Команда**: `npm run test:fast`
- **Использование**: `docker-compose up playwright-tests`

### 2. playwright-full (Полные тесты)
- **Назначение**: Все тесты
- **Команда**: `npm run test:all`
- **Использование**: `docker-compose --profile full up`

### 3. playwright-monitor (Мониторинг)
- **Назначение**: Непрерывный мониторинг
- **Команда**: `npm run monitor:continuous`
- **Использование**: `docker-compose --profile monitor up`

### 4. playwright-dev (Разработка)
- **Назначение**: Режим разработки с UI
- **Команда**: `npm run test:ui`
- **Порт**: 9323
- **Использование**: `docker-compose --profile dev up`

## 🔧 Конфигурация

### Dockerfile
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
RUN npx playwright install --with-deps
```

### docker-compose.yml
```yaml
services:
  playwright-tests:
    build: .
    volumes:
      - ./reports:/app/reports
      - ./test-results:/app/test-results
    command: npm run test:fast
```

## 📁 Volumes

### Монтируемые директории:
- `./reports` → `/app/reports` - Отчеты тестов
- `./test-results` → `/app/test-results` - Результаты тестов
- `./config` → `/app/config` - Конфигурация

## 🌍 Переменные окружения

```bash
NODE_ENV=production
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
```

## 🛠️ Разработка

### Режим разработки
```bash
# Запуск с UI
npm run docker:dev

# Доступ к UI: http://localhost:9323
```

### Отладка
```bash
# Запуск с отладкой
docker-compose run --rm playwright-tests npm run test:debug

# Интерактивный режим
docker-compose run --rm -it playwright-tests bash
```

## 📊 Мониторинг

### Непрерывный мониторинг
```bash
# Запуск мониторинга
npm run docker:monitor

# Просмотр логов
docker-compose logs -f playwright-monitor
```

### Telegram уведомления
```bash
# Настройка Telegram
docker-compose run --rm playwright-tests npm run telegram:setup

# Тест уведомлений
docker-compose run --rm playwright-tests npm run telegram:test
```

## 🧹 Очистка

### Очистка контейнеров
```bash
# Остановка всех сервисов
docker-compose down

# Удаление образов
docker-compose down --rmi all

# Полная очистка
npm run docker:clean
```

### Очистка системы
```bash
# Удаление неиспользуемых ресурсов
docker system prune -f

# Удаление всех образов
docker system prune -a -f
```

## 🐛 Troubleshooting

### Проблемы с браузерами
```bash
# Переустановка браузеров
docker-compose run --rm playwright-tests npx playwright install --with-deps
```

### Проблемы с правами
```bash
# Исправление прав
chmod +x scripts/docker-*.sh
```

### Проблемы с памятью
```bash
# Увеличение лимита памяти
docker-compose run --rm -e NODE_OPTIONS="--max-old-space-size=4096" playwright-tests
```

## 📈 Производительность

### Оптимизация
- Используйте `npm run docker:fast` для быстрых тестов
- Настройте `docker-compose.override.yml` для разработки
- Используйте `.dockerignore` для исключения ненужных файлов

### Масштабирование
```bash
# Запуск нескольких экземпляров
docker-compose up --scale playwright-tests=3
```

## 🔒 Безопасность

### Рекомендации
- Не запускайте в production с root правами
- Используйте secrets для конфиденциальных данных
- Регулярно обновляйте базовые образы

## 📚 Полезные ссылки

- [Playwright Docker](https://playwright.dev/docs/docker)
- [Docker Compose](https://docs.docker.com/compose/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
