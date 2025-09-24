# Установка зависимостей Playwright для Ubuntu 25.04

## Проблема
Playwright не поддерживает Ubuntu 25.04 официально и пытается установить `libicu74`, который недоступен в репозиториях Ubuntu 25.04.

## Решение

### 1. Обновите список пакетов
```bash
sudo apt update
```

### 2. Установите правильные зависимости для Ubuntu 25.04
```bash
sudo apt install -y \
    libwoff1 \
    libgstreamer-plugins-bad1.0-0 \
    libmanette-0.2-0 \
    libicu76 \
    libharfbuzz0b \
    libgstreamer-gl1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    libgstreamer1.0-0 \
    libgtk-3-0 \
    libgtk-4-1 \
    libxss1 \
    libasound2 \
    libatspi2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0
```

### 3. Установите дополнительные зависимости для браузеров
```bash
sudo apt install -y \
    libnss3 \
    libxtst6 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgdk-pixbuf2.0-0
```

### 4. Установите шрифты
```bash
sudo apt install -y \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-noto-cjk
```

### 5. Установите браузеры Playwright
```bash
npx playwright install
```

### 6. Проверьте установку
```bash
npm run test:health
```

## Альтернативный способ

Если проблемы продолжаются, можно попробовать установить зависимости вручную:

```bash
# Установите только основные пакеты
sudo apt install -y libwoff1 libgstreamer-plugins-bad1.0-0 libmanette-0.2-0 libicu76

# Затем установите браузеры
npx playwright install
```

## Проверка установки

После установки всех зависимостей проверьте:

```bash
# Проверка основных пакетов
dpkg -l | grep libicu76
dpkg -l | grep libwoff1
dpkg -l | grep libgstreamer-plugins-bad1.0-0
dpkg -l | grep libmanette-0.2-0

# Запуск тестов
npm run test:health
```

## Примечания

- Ubuntu 25.04 использует `libicu76` вместо `libicu74`
- Playwright автоматически определяет Ubuntu 25.04 как Ubuntu 24.04 и пытается установить неправильные пакеты
- Ручная установка зависимостей решает эту проблему
