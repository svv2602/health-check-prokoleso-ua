#!/usr/bin/env node

/**
 * Playwright Reporter с Telegram уведомлениями
 * Автор: Prokoleso Health Check Team
 * Версия: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const TelegramNotifier = require('./telegram-notifier');

class PlaywrightTelegramReporter {
  constructor(options = {}) {
    this.config = options.config || this.loadConfig();
    this.telegramNotifier = null;
    this.testResults = [];
    this.startTime = null;
    
    // Инициализация Telegram уведомлений
    if (this.config.notifications?.telegram?.enabled) {
      this.telegramNotifier = new TelegramNotifier(this.config.notifications.telegram);
    }
  }

  loadConfig() {
    const configPath = path.join(__dirname, '..', 'config', 'monitor.json');
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (err) {
        console.warn('⚠️ Ошибка чтения конфигурации:', err.message);
      }
    }
    return {};
  }

  onBegin(config, suite) {
    this.startTime = Date.now();
    console.log('🚀 Запуск тестирования с Telegram уведомлениями');
    
    if (this.telegramNotifier) {
      console.log('📱 Telegram уведомления включены');
    }
  }

  onTestBegin(test, result) {
    console.log(`🧪 Начало теста: ${test.title}`);
  }

  onTestEnd(test, result) {
    const testResult = {
      title: test.title,
      status: result.status,
      duration: result.duration,
      error: this.formatError(result.error),
      browser: this.getBrowserName(test),
      url: this.getTestUrl(test),
      timestamp: new Date().toISOString(),
      screenshot: null,
      trace: null
    };

    // Сохраняем скриншот если тест провалился
    if (result.status === 'failed' && result.attachments) {
      const screenshot = result.attachments.find(att => att.name === 'screenshot');
      if (screenshot) {
        testResult.screenshot = screenshot.path;
      }
      
      const trace = result.attachments.find(att => att.name === 'trace');
      if (trace) {
        testResult.trace = trace.path;
      }
    }

    this.testResults.push(testResult);

    // Отправляем уведомление об ошибке
    if (result.status === 'failed' && this.telegramNotifier && this.config.notifications.telegram.notifyOnTestFailures) {
      console.log(`❌ Тест провален: ${test.title} - отправка уведомления`);
      this.telegramNotifier.sendTestError(testResult);
    }
  }

  onEnd(result) {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const summary = {
      totalTests: result.total,
      passed: result.passed,
      failed: result.failed,
      skipped: result.skipped,
      duration: duration,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Результаты тестирования:');
    console.log(`   Всего тестов: ${summary.totalTests}`);
    console.log(`   ✅ Прошло: ${summary.passed}`);
    console.log(`   ❌ Провалено: ${summary.failed}`);
    console.log(`   ⏭️ Пропущено: ${summary.skipped}`);
    console.log(`   ⏱️ Длительность: ${Math.round(duration / 1000)}с`);

    // Отправляем сводный отчет
    if (this.telegramNotifier && this.config.notifications.telegram.notifyOnReports) {
      console.log('📱 Отправка сводного отчета в Telegram');
      this.telegramNotifier.sendReport(summary);
    }

    // Сохраняем детальный отчет
    this.saveDetailedReport(summary);
  }

  getBrowserName(test) {
    // Извлекаем название браузера из контекста теста
    if (test.parent && test.parent.project) {
      return test.parent.project.name || 'Unknown';
    }
    return 'Unknown';
  }

  getTestUrl(test) {
    // Извлекаем URL из теста
    if (test.title && test.title.includes('prokoleso.ua')) {
      return 'https://prokoleso.ua';
    }
    return 'https://prokoleso.ua';
  }

  saveDetailedReport(summary) {
    const reportDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'telegram-test-report.json');
    const detailedReport = {
      summary,
      testResults: this.testResults,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
    console.log(`📄 Детальный отчет сохранен: ${reportPath}`);
  }

  // Метод для отправки уведомления о критической ошибке
  async sendCriticalError(error, context = {}) {
    if (!this.telegramNotifier) return;

    const errorInfo = {
      testName: 'Критическая ошибка системы',
      error: error.message || error,
      browser: context.browser || 'System',
      url: context.url || 'https://prokoleso.ua',
      timestamp: new Date().toISOString()
    };

    await this.telegramNotifier.sendTestError(errorInfo);
  }

  // Метод для отправки уведомления о восстановлении
  async sendRecoveryNotification() {
    if (!this.telegramNotifier) return;

    const message = `🟢 <b>СИСТЕМА ВОССТАНОВЛЕНА</b>

✅ Все тесты проходят успешно
🕐 Время: ${new Date().toLocaleString('ru-RU')}

<b>Статус:</b> Нормальная работа
<b>Следующая проверка:</b> Через 5 минут`;

    await this.telegramNotifier.sendMessage(message);
  }

  /**
   * Форматирование ошибки в читаемый текст
   * @param {any} error - Ошибка (строка, объект, Error)
   * @returns {string} - Отформатированная ошибка
   */
  formatError(error) {
    if (!error) {
      return 'Неизвестная ошибка';
    }

    // Если это уже строка
    if (typeof error === 'string') {
      return error;
    }

    // Если это объект Error
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }

    // Если это обычный объект
    if (typeof error === 'object') {
      // Пытаемся извлечь полезную информацию
      const parts = [];
      
      if (error.message) {
        parts.push(`Сообщение: ${error.message}`);
      }
      
      if (error.name) {
        parts.push(`Тип: ${error.name}`);
      }
      
      if (error.code) {
        parts.push(`Код: ${error.code}`);
      }
      
      if (error.status) {
        parts.push(`Статус: ${error.status}`);
      }
      
      if (error.stack) {
        // Берем только первые 3 строки stack trace
        const stackLines = error.stack.split('\n').slice(0, 3);
        parts.push(`Stack: ${stackLines.join(' → ')}`);
      }

      // Если ничего не нашли, пытаемся JSON.stringify
      if (parts.length === 0) {
        try {
          const jsonStr = JSON.stringify(error, null, 2);
          // Ограничиваем длину для Telegram
          return jsonStr.length > 1000 ? jsonStr.substring(0, 1000) + '...' : jsonStr;
        } catch (e) {
          return 'Объект ошибки не может быть сериализован';
        }
      }

      return parts.join('\n');
    }

    // Для других типов
    return String(error);
  }
}

module.exports = PlaywrightTelegramReporter;
