#!/usr/bin/env node

/**
 * Скрипт настройки Telegram бота для уведомлений
 * Автор: Prokoleso Health Check Team
 * Версия: 1.0.0
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class TelegramSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.configPath = path.join(__dirname, '..', 'config', 'monitor.json');
    this.envPath = path.join(__dirname, '..', '.env');
  }

  async run() {
    console.log('🤖 Настройка Telegram бота для уведомлений\n');
    
    try {
      // Проверяем существование конфигурации
      if (!fs.existsSync(this.configPath)) {
        console.error('❌ Файл конфигурации не найден:', this.configPath);
        process.exit(1);
      }

      // Загружаем текущую конфигурацию
      const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      
      console.log('📋 Инструкция по настройке Telegram бота:\n');
      console.log('1. Создайте бота через @BotFather в Telegram');
      console.log('2. Получите токен бота');
      console.log('3. Добавьте бота в группу или получите chat ID');
      console.log('4. Настройте права администратора для бота\n');

      // Запрашиваем токен бота
      const botToken = await this.askQuestion('Введите токен бота (или нажмите Enter для пропуска): ');
      if (!botToken) {
        console.log('⚠️ Настройка пропущена');
        return;
      }

      // Проверяем токен
      const botInfo = await this.verifyBotToken(botToken);
      if (!botInfo) {
        console.error('❌ Неверный токен бота');
        return;
      }

      console.log(`✅ Бот найден: @${botInfo.username} (${botInfo.first_name})`);

      // Запрашиваем chat ID
      const chatId = await this.askQuestion('Введите chat ID (или нажмите Enter для автоматического определения): ');
      let finalChatId = chatId;

      if (!chatId) {
        console.log('\n🔍 Попытка автоматического определения chat ID...');
        finalChatId = await this.detectChatId(botToken);
      }

      if (!finalChatId) {
        console.log('⚠️ Chat ID не определен. Настройте вручную позже.');
        return;
      }

      // Проверяем chat ID
      const chatInfo = await this.verifyChatId(botToken, finalChatId);
      if (chatInfo) {
        console.log(`✅ Chat найден: ${chatInfo.title || chatInfo.first_name || 'Приватный чат'}`);
      }

      // Обновляем конфигурацию
      config.notifications.telegram.botToken = botToken;
      config.notifications.telegram.chatId = finalChatId;
      config.notifications.telegram.enabled = true;

      // Сохраняем конфигурацию
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      console.log('✅ Конфигурация обновлена');

      // Создаем .env файл
      await this.createEnvFile(botToken, finalChatId);

      // Отправляем тестовое сообщение
      const sendTest = await this.askQuestion('Отправить тестовое сообщение? (y/n): ');
      if (sendTest.toLowerCase() === 'y' || sendTest.toLowerCase() === 'yes') {
        await this.sendTestMessage(botToken, finalChatId);
      }

      console.log('\n🎉 Настройка завершена!');
      console.log('📝 Токен бота:', botToken);
      console.log('💬 Chat ID:', finalChatId);
      console.log('📁 Конфигурация сохранена в:', this.configPath);
      console.log('🔧 Переменные окружения сохранены в:', this.envPath);

    } catch (error) {
      console.error('❌ Ошибка настройки:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async verifyBotToken(token) {
    try {
      const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
      return response.data.ok ? response.data.result : null;
    } catch (error) {
      return null;
    }
  }

  async detectChatId(token) {
    try {
      console.log('📨 Отправьте любое сообщение боту @' + (await this.verifyBotToken(token))?.username);
      console.log('⏳ Ожидание сообщения... (30 секунд)');
      
      const startTime = Date.now();
      const timeout = 30000; // 30 секунд
      
      while (Date.now() - startTime < timeout) {
        const updates = await this.getUpdates(token);
        if (updates.length > 0) {
          const chatId = updates[updates.length - 1].message.chat.id;
          console.log(`✅ Chat ID определен: ${chatId}`);
          return chatId.toString();
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('⏰ Время ожидания истекло');
      return null;
    } catch (error) {
      console.error('❌ Ошибка определения chat ID:', error.message);
      return null;
    }
  }

  async getUpdates(token) {
    try {
      const response = await axios.get(`https://api.telegram.org/bot${token}/getUpdates`);
      return response.data.ok ? response.data.result : [];
    } catch (error) {
      return [];
    }
  }

  async verifyChatId(token, chatId) {
    try {
      const response = await axios.get(`https://api.telegram.org/bot${token}/getChat?chat_id=${chatId}`);
      return response.data.ok ? response.data.result : null;
    } catch (error) {
      return null;
    }
  }

  async createEnvFile(botToken, chatId) {
    const envContent = `# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=${botToken}
TELEGRAM_CHAT_ID=${chatId}

# Prokoleso Health Check Configuration
PROKOLESO_URL=https://prokoleso.ua
MONITOR_INTERVAL=300000
HEADLESS=true
TIMEOUT=30000

# Notification Settings
NOTIFY_ON_ERRORS=true
NOTIFY_ON_SITE_DOWN=true
NOTIFY_ON_SLOW_PERFORMANCE=true
NOTIFY_ON_TEST_FAILURES=true
`;

    fs.writeFileSync(this.envPath, envContent);
    console.log('✅ Файл .env создан');
  }

  async sendTestMessage(token, chatId) {
    try {
      const message = `🤖 <b>Тестовое сообщение</b>

✅ Telegram уведомления настроены успешно!

<b>Настройки:</b>
• Бот: @${(await this.verifyBotToken(token))?.username}
• Chat ID: ${chatId}
• Время: ${new Date().toLocaleString('ru-RU')}

<b>Функции:</b>
• Уведомления об ошибках тестирования
• Алерты о недоступности сайта
• Отчеты о медленной производительности
• Отправка скриншотов и trace файлов

🎉 Система готова к работе!`;

      const response = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      });

      if (response.data.ok) {
        console.log('✅ Тестовое сообщение отправлено');
      } else {
        console.log('⚠️ Не удалось отправить тестовое сообщение');
      }
    } catch (error) {
      console.log('⚠️ Ошибка отправки тестового сообщения:', error.message);
    }
  }
}

// Запуск скрипта
if (require.main === module) {
  const setup = new TelegramSetup();
  setup.run().catch(console.error);
}

module.exports = TelegramSetup;
