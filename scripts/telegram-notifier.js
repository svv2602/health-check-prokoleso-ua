#!/usr/bin/env node

/**
 * Telegram Notifier для отправки уведомлений об ошибках тестирования
 * Автор: Prokoleso Health Check Team
 * Версия: 1.0.0
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class TelegramNotifier {
  constructor(config = {}) {
    this.botToken = config.botToken || process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = config.chatId || process.env.TELEGRAM_CHAT_ID;
    this.enabled = config.enabled !== false && this.botToken && this.chatId;
    
    if (this.enabled) {
      this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
      console.log('✅ Telegram Notifier инициализирован');
    } else {
      console.log('⚠️ Telegram Notifier отключен - отсутствуют токен или chat ID');
    }
  }

  /**
   * Отправка простого текстового сообщения
   * @param {string} message - Текст сообщения
   * @param {Object} options - Дополнительные опции
   */
  async sendMessage(message, options = {}) {
    if (!this.enabled) {
      console.log('📤 Telegram уведомление (отключено):', message);
      return false;
    }

    try {
      const payload = {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...options
      };

      const response = await axios.post(`${this.baseUrl}/sendMessage`, payload);
      
      if (response.data.ok) {
        console.log('✅ Telegram сообщение отправлено');
        return true;
      } else {
        console.error('❌ Ошибка отправки Telegram сообщения:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка при отправке в Telegram:', error.message);
      return false;
    }
  }

  /**
   * Отправка уведомления об ошибке тестирования
   * @param {Object} errorInfo - Информация об ошибке
   */
  async sendTestError(errorInfo) {
    const {
      testName = 'Неизвестный тест',
      error = 'Неизвестная ошибка',
      browser = 'Неизвестный браузер',
      url = 'https://prokoleso.ua',
      timestamp = new Date().toISOString(),
      screenshot = null,
      trace = null
    } = errorInfo;

    const message = this.formatTestErrorMessage({
      testName,
      error,
      browser,
      url,
      timestamp
    });

    const success = await this.sendMessage(message);

    // Отправка скриншота если есть
    if (success && screenshot && fs.existsSync(screenshot)) {
      await this.sendScreenshot(screenshot, `Скриншот ошибки: ${testName}`);
    }

    // Отправка trace файла если есть
    if (success && trace && fs.existsSync(trace)) {
      await this.sendTraceFile(trace, `Trace файл: ${testName}`);
    }

    return success;
  }

  /**
   * Отправка уведомления о недоступности сайта
   * @param {Object} siteInfo - Информация о сайте
   */
  async sendSiteDown(siteInfo) {
    const {
      url = 'https://prokoleso.ua',
      error = 'Сайт недоступен',
      responseTime = 0,
      timestamp = new Date().toISOString()
    } = siteInfo;

    const message = this.formatSiteDownMessage({
      url,
      error,
      responseTime,
      timestamp
    });

    return await this.sendMessage(message);
  }

  /**
   * Отправка уведомления о медленной загрузке
   * @param {Object} performanceInfo - Информация о производительности
   */
  async sendSlowPerformance(performanceInfo) {
    const {
      url = 'https://prokoleso.ua',
      loadTime = 0,
      threshold = 10000,
      timestamp = new Date().toISOString()
    } = performanceInfo;

    const message = this.formatSlowPerformanceMessage({
      url,
      loadTime,
      threshold,
      timestamp
    });

    return await this.sendMessage(message);
  }

  /**
   * Отправка скриншота
   * @param {string} screenshotPath - Путь к файлу скриншота
   * @param {string} caption - Подпись к изображению
   */
  async sendScreenshot(screenshotPath, caption = '') {
    if (!this.enabled || !fs.existsSync(screenshotPath)) {
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('chat_id', this.chatId);
      formData.append('photo', fs.createReadStream(screenshotPath));
      if (caption) {
        formData.append('caption', caption);
      }

      const response = await axios.post(`${this.baseUrl}/sendPhoto`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.ok) {
        console.log('✅ Скриншот отправлен в Telegram');
        return true;
      } else {
        console.error('❌ Ошибка отправки скриншота:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка при отправке скриншота:', error.message);
      return false;
    }
  }

  /**
   * Отправка trace файла
   * @param {string} tracePath - Путь к trace файлу
   * @param {string} caption - Подпись к файлу
   */
  async sendTraceFile(tracePath, caption = '') {
    if (!this.enabled || !fs.existsSync(tracePath)) {
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('chat_id', this.chatId);
      formData.append('document', fs.createReadStream(tracePath));
      if (caption) {
        formData.append('caption', caption);
      }

      const response = await axios.post(`${this.baseUrl}/sendDocument`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.ok) {
        console.log('✅ Trace файл отправлен в Telegram');
        return true;
      } else {
        console.error('❌ Ошибка отправки trace файла:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка при отправке trace файла:', error.message);
      return false;
    }
  }

  /**
   * Отправка сводного отчета
   * @param {Object} reportInfo - Информация об отчете
   */
  async sendReport(reportInfo) {
    const {
      totalTests = 0,
      passed = 0,
      failed = 0,
      skipped = 0,
      duration = 0,
      timestamp = new Date().toISOString()
    } = reportInfo;

    const message = this.formatReportMessage({
      totalTests,
      passed,
      failed,
      skipped,
      duration,
      timestamp
    });

    return await this.sendMessage(message);
  }

  /**
   * Форматирование сообщения об ошибке тестирования
   */
  formatTestErrorMessage({ testName, error, browser, url, timestamp }) {
    const emoji = '🚨';
    const time = new Date(timestamp).toLocaleString('ru-RU');
    const formattedError = this.formatError(error);
    
    return `${emoji} <b>ОШИБКА ТЕСТИРОВАНИЯ</b>

<b>Тест:</b> ${testName}
<b>Браузер:</b> ${browser}
<b>URL:</b> ${url}
<b>Время:</b> ${time}

<b>Ошибка:</b>
<code>${formattedError}</code>

<b>Следующие шаги:</b>
• Проверить доступность сайта
• Проверить логи сервера
• Запустить тесты повторно`;
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

  /**
   * Форматирование сообщения о недоступности сайта
   */
  formatSiteDownMessage({ url, error, responseTime, timestamp }) {
    const emoji = '🔴';
    const time = new Date(timestamp).toLocaleString('ru-RU');
    const formattedError = this.formatError(error);
    
    return `${emoji} <b>САЙТ НЕДОСТУПЕН</b>

<b>URL:</b> ${url}
<b>Время ответа:</b> ${responseTime}мс
<b>Время:</b> ${time}

<b>Ошибка:</b>
<code>${formattedError}</code>

<b>Срочные действия:</b>
• Проверить статус сервера
• Проверить DNS
• Уведомить команду разработки`;
  }

  /**
   * Форматирование сообщения о медленной производительности
   */
  formatSlowPerformanceMessage({ url, loadTime, threshold, timestamp }) {
    const emoji = '🐌';
    const time = new Date(timestamp).toLocaleString('ru-RU');
    const percentage = Math.round((loadTime / threshold) * 100);
    
    return `${emoji} <b>МЕДЛЕННАЯ ЗАГРУЗКА</b>

<b>URL:</b> ${url}
<b>Время загрузки:</b> ${loadTime}мс (${percentage}% от лимита)
<b>Лимит:</b> ${threshold}мс
<b>Время:</b> ${time}

<b>Рекомендации:</b>
• Проверить производительность сервера
• Оптимизировать изображения
• Проверить CDN`;
  }

  /**
   * Форматирование сводного отчета
   */
  formatReportMessage({ totalTests, passed, failed, skipped, duration, timestamp }) {
    const emoji = failed > 0 ? '⚠️' : '✅';
    const time = new Date(timestamp).toLocaleString('ru-RU');
    const successRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;
    
    return `${emoji} <b>ОТЧЕТ О ТЕСТИРОВАНИИ</b>

<b>Всего тестов:</b> ${totalTests}
<b>✅ Прошло:</b> ${passed}
<b>❌ Провалено:</b> ${failed}
<b>⏭️ Пропущено:</b> ${skipped}
<b>📊 Успешность:</b> ${successRate}%
<b>⏱️ Длительность:</b> ${Math.round(duration / 1000)}с
<b>🕐 Время:</b> ${time}`;
  }

  /**
   * Проверка работоспособности бота
   */
  async checkBotStatus() {
    if (!this.enabled) {
      return { status: 'disabled', message: 'Telegram уведомления отключены' };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/getMe`);
      
      if (response.data.ok) {
        const botInfo = response.data.result;
        return {
          status: 'ok',
          message: `Бот @${botInfo.username} активен`,
          botInfo
        };
      } else {
        return {
          status: 'error',
          message: 'Ошибка получения информации о боте'
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Ошибка подключения к Telegram API: ${error.message}`
      };
    }
  }
}

module.exports = TelegramNotifier;
