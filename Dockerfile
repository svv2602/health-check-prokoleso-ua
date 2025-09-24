# Dockerfile для Playwright тестирования Prokoleso.ua
FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Установка рабочей директории
WORKDIR /app

# Копирование файлов проекта
COPY package*.json ./
COPY playwright.config.optimized.ts ./
COPY config/ ./config/
COPY scripts/ ./scripts/
COPY tests/ ./tests/

# Установка зависимостей
RUN npm ci --only=production

# Установка браузеров Playwright
RUN npx playwright install --with-deps

# Создание директорий для отчетов
RUN mkdir -p reports test-results

# Установка прав на выполнение скриптов
RUN chmod +x scripts/*.js

# Переменные окружения
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Команда по умолчанию
CMD ["npm", "run", "test:fast"]
