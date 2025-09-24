#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки Telegram уведомлений
 * Автор: Prokoleso Health Check Team
 * Версия: 1.0.0
 */

const TelegramNotifier = require('./telegram-notifier');
const fs = require('fs');
const path = require('path');

async function testTelegramNotifications() {
  console.log('🧪 Тестирование Telegram уведомлений\n');

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
    console.log('💡 Запустите: npm run telegram:setup');
    return;
  }

  if (!config.notifications.telegram.botToken || !config.notifications.telegram.chatId) {
    console.log('⚠️ Не настроены токен бота или chat ID');
    console.log('💡 Запустите: npm run telegram:setup');
    return;
  }

  // Инициализируем уведомления
  const notifier = new TelegramNotifier(config.notifications.telegram);

  try {
    // Проверяем статус бота
    console.log('🔍 Проверка статуса бота...');
    const botStatus = await notifier.checkBotStatus();
    console.log(`📱 Статус: ${botStatus.status}`);
    console.log(`💬 Сообщение: ${botStatus.message}`);

    if (botStatus.status !== 'ok') {
      console.log('❌ Бот недоступен, проверьте настройки');
      return;
    }

    console.log('\n📤 Отправка тестовых уведомлений...\n');

    // Тест 1: Простое сообщение
    console.log('1️⃣ Тест простого сообщения...');
    const messageResult = await notifier.sendMessage('🧪 <b>Тестовое сообщение</b>\n\n✅ Telegram уведомления работают корректно!');
    console.log(`   Результат: ${messageResult ? '✅ Успешно' : '❌ Ошибка'}`);

    // Тест 2: Уведомление об ошибке тестирования
    console.log('\n2️⃣ Тест уведомления об ошибке тестирования...');
    const testErrorResult = await notifier.sendTestError({
      testName: 'Тестовый тест проверки сайта',
      error: 'TimeoutError: page.goto: Timeout 30000ms exceeded',
      browser: 'chromium',
      url: 'https://prokoleso.ua',
      timestamp: new Date().toISOString()
    });
    console.log(`   Результат: ${testErrorResult ? '✅ Успешно' : '❌ Ошибка'}`);

    // Тест 3: Уведомление о недоступности сайта
    console.log('\n3️⃣ Тест уведомления о недоступности сайта...');
    const siteDownResult = await notifier.sendSiteDown({
      url: 'https://prokoleso.ua',
      error: 'Connection timeout after 30000ms',
      responseTime: 30000,
      timestamp: new Date().toISOString()
    });
    console.log(`   Результат: ${siteDownResult ? '✅ Успешно' : '❌ Ошибка'}`);

    // Тест 4: Уведомление о медленной производительности
    console.log('\n4️⃣ Тест уведомления о медленной производительности...');
    const slowPerformanceResult = await notifier.sendSlowPerformance({
      url: 'https://prokoleso.ua',
      loadTime: 15000,
      threshold: 10000,
      timestamp: new Date().toISOString()
    });
    console.log(`   Результат: ${slowPerformanceResult ? '✅ Успешно' : '❌ Ошибка'}`);

    // Тест 5: Сводный отчет
    console.log('\n5️⃣ Тест сводного отчета...');
    const reportResult = await notifier.sendReport({
      totalTests: 25,
      passed: 23,
      failed: 2,
      skipped: 0,
      duration: 45000,
      timestamp: new Date().toISOString()
    });
    console.log(`   Результат: ${reportResult ? '✅ Успешно' : '❌ Ошибка'}`);

    // Итоговый результат
    console.log('\n📊 Результаты тестирования:');
    console.log(`   Простое сообщение: ${messageResult ? '✅' : '❌'}`);
    console.log(`   Ошибка тестирования: ${testErrorResult ? '✅' : '❌'}`);
    console.log(`   Недоступность сайта: ${siteDownResult ? '✅' : '❌'}`);
    console.log(`   Медленная производительность: ${slowPerformanceResult ? '✅' : '❌'}`);
    console.log(`   Сводный отчет: ${reportResult ? '✅' : '❌'}`);

    const allPassed = messageResult && testErrorResult && siteDownResult && slowPerformanceResult && reportResult;
    
    if (allPassed) {
      console.log('\n🎉 Все тесты прошли успешно!');
      console.log('📱 Telegram уведомления настроены и работают корректно.');
    } else {
      console.log('\n⚠️ Некоторые тесты не прошли.');
      console.log('💡 Проверьте настройки бота и повторите тестирование.');
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

// Запуск тестирования
if (require.main === module) {
  testTelegramNotifications().catch(console.error);
}

module.exports = testTelegramNotifications;
