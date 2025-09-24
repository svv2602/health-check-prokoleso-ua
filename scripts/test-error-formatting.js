#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки форматирования ошибок
 * Автор: Prokoleso Health Check Team
 * Версия: 1.0.0
 */

const TelegramNotifier = require('./telegram-notifier');
const fs = require('fs');
const path = require('path');

async function testErrorFormatting() {
  console.log('🧪 Тестирование форматирования ошибок\n');

  // Загружаем конфигурацию
  const configPath = path.join(__dirname, '..', 'config', 'monitor.json');
  let config = {};
  
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
      console.error('❌ Ошибка чтения конфигурации:', err.message);
      return;
    }
  }

  // Проверяем настройки Telegram
  if (!config.notifications?.telegram?.enabled) {
    console.log('⚠️ Telegram уведомления отключены в конфигурации');
    return;
  }

  if (!config.notifications.telegram.botToken || !config.notifications.telegram.chatId) {
    console.log('⚠️ Не настроены токен бота или chat ID');
    return;
  }

  // Инициализируем уведомления
  const notifier = new TelegramNotifier(config.notifications.telegram);

  try {
    console.log('📤 Тестирование различных типов ошибок...\n');

    // Тест 1: Строковая ошибка
    console.log('1️⃣ Тест строковой ошибки...');
    await notifier.sendTestError({
      testName: 'Тест строковой ошибки',
      error: 'TimeoutError: page.goto: Timeout 30000ms exceeded',
      browser: 'chromium',
      url: 'https://prokoleso.ua',
      timestamp: new Date().toISOString()
    });
    console.log('   ✅ Отправлено');

    // Тест 2: Объект Error
    console.log('\n2️⃣ Тест объекта Error...');
    const errorObj = new Error('Navigation timeout');
    errorObj.name = 'TimeoutError';
    await notifier.sendTestError({
      testName: 'Тест объекта Error',
      error: errorObj,
      browser: 'chromium',
      url: 'https://prokoleso.ua',
      timestamp: new Date().toISOString()
    });
    console.log('   ✅ Отправлено');

    // Тест 3: Обычный объект с полями
    console.log('\n3️⃣ Тест обычного объекта...');
    const plainObj = {
      message: 'Connection failed',
      code: 'ECONNREFUSED',
      status: 500,
      stack: 'Error: Connection failed\n    at Object.connect (/app/index.js:10:5)\n    at main (/app/index.js:25:3)'
    };
    await notifier.sendTestError({
      testName: 'Тест обычного объекта',
      error: plainObj,
      browser: 'chromium',
      url: 'https://prokoleso.ua',
      timestamp: new Date().toISOString()
    });
    console.log('   ✅ Отправлено');

    // Тест 4: Сложный объект
    console.log('\n4️⃣ Тест сложного объекта...');
    const complexObj = {
      name: 'PlaywrightError',
      message: 'Element not found',
      code: 'ELEMENT_NOT_FOUND',
      selector: 'button[data-testid="submit"]',
      timeout: 5000,
      url: 'https://prokoleso.ua/checkout',
      screenshot: '/tmp/screenshot.png',
      trace: '/tmp/trace.zip',
      metadata: {
        browser: 'chromium',
        version: '1.40.0',
        platform: 'linux'
      }
    };
    await notifier.sendTestError({
      testName: 'Тест сложного объекта',
      error: complexObj,
      browser: 'chromium',
      url: 'https://prokoleso.ua',
      timestamp: new Date().toISOString()
    });
    console.log('   ✅ Отправлено');

    // Тест 5: Объект без полезных полей
    console.log('\n5️⃣ Тест объекта без полезных полей...');
    const uselessObj = {
      someProperty: 'value',
      anotherProperty: 123,
      nested: {
        deep: {
          value: 'nested'
        }
      }
    };
    await notifier.sendTestError({
      testName: 'Тест объекта без полезных полей',
      error: uselessObj,
      browser: 'chromium',
      url: 'https://prokoleso.ua',
      timestamp: new Date().toISOString()
    });
    console.log('   ✅ Отправлено');

    // Тест 6: null/undefined ошибка
    console.log('\n6️⃣ Тест null/undefined ошибки...');
    await notifier.sendTestError({
      testName: 'Тест null ошибки',
      error: null,
      browser: 'chromium',
      url: 'https://prokoleso.ua',
      timestamp: new Date().toISOString()
    });
    console.log('   ✅ Отправлено');

    console.log('\n🎉 Все тесты форматирования ошибок завершены!');
    console.log('📱 Проверьте Telegram для просмотра результатов');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

// Запуск тестирования
if (require.main === module) {
  testErrorFormatting().catch(console.error);
}

module.exports = testErrorFormatting;
