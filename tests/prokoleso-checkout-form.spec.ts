import { test, expect } from '@playwright/test';

/**
 * Тест формы заказа на странице checkout
 * Проверяет все поля формы, валидацию и функциональность
 */

test.describe('Форма заказа - Prokoleso.ua', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу заказа
    await page.goto('https://prokoleso.ua/ua/checkout/');
    
    // Ждем загрузки страницы
    await page.waitForLoadState('networkidle');
  });

  test('Проверка доступности страницы заказа', async ({ page }) => {
    // Проверяем, что страница загрузилась
    await expect(page).toHaveTitle(/Prokoleso.ua/);
    
    // Проверяем наличие основных элементов
    await expect(page.locator('h1, h2, h3')).toContainText(/заказ|оформление|checkout/i);
  });

  test('Проверка полей формы заказа - личные данные', async ({ page }) => {
    // Проверяем наличие полей личных данных
    const personalFields = [
      { selector: 'input[name*="name"], input[placeholder*="ім\'я"], input[placeholder*="имя"]', label: 'Имя' },
      { selector: 'input[name*="surname"], input[placeholder*="прізвище"], input[placeholder*="фамилия"]', label: 'Фамилия' },
      { selector: 'input[name*="phone"], input[type="tel"], input[placeholder*="телефон"]', label: 'Телефон' },
      { selector: 'input[name*="email"], input[type="email"], input[placeholder*="email"]', label: 'Email' }
    ];

    for (const field of personalFields) {
      const element = page.locator(field.selector).first();
      await expect(element).toBeVisible({ timeout: 5000 });
      console.log(`✅ Поле "${field.label}" найдено`);
    }
  });

  test('Проверка полей адреса доставки', async ({ page }) => {
    // Проверяем поля адреса
    const addressFields = [
      { selector: 'input[name*="city"], input[placeholder*="місто"], input[placeholder*="город"]', label: 'Город' },
      { selector: 'input[name*="address"], input[placeholder*="адреса"], textarea[name*="address"]', label: 'Адрес' },
      { selector: 'input[name*="postal"], input[name*="zip"], input[placeholder*="індекс"]', label: 'Почтовый индекс' }
    ];

    for (const field of addressFields) {
      const element = page.locator(field.selector).first();
      if (await element.isVisible()) {
        console.log(`✅ Поле "${field.label}" найдено`);
      } else {
        console.log(`⚠️ Поле "${field.label}" не найдено или скрыто`);
      }
    }
  });

  test('Проверка селектов и выпадающих списков', async ({ page }) => {
    // Ищем все селекты и выпадающие списки
    const selects = page.locator('select, [role="combobox"], .select, .dropdown');
    
    const selectCount = await selects.count();
    console.log(`📋 Найдено селектов: ${selectCount}`);

    for (let i = 0; i < selectCount; i++) {
      const select = selects.nth(i);
      if (await select.isVisible()) {
        const label = await select.getAttribute('aria-label') || 
                     await select.getAttribute('placeholder') || 
                     await select.getAttribute('name') || 
                     `Селект ${i + 1}`;
        
        console.log(`🔍 Проверяем селект: ${label}`);
        
        // Проверяем, что селект кликабельный
        await expect(select).toBeEnabled();
        
        // Пытаемся открыть селект
        try {
          await select.click();
          await page.waitForTimeout(500);
          
          // Ищем опции
          const options = page.locator('option, [role="option"], .option, .dropdown-item');
          const optionCount = await options.count();
          
          if (optionCount > 0) {
            console.log(`  ✅ Найдено опций: ${optionCount}`);
            
            // Проверяем первые несколько опций
            for (let j = 0; j < Math.min(3, optionCount); j++) {
              const option = options.nth(j);
              const optionText = await option.textContent();
              if (optionText && optionText.trim()) {
                console.log(`    - ${optionText.trim()}`);
              }
            }
          } else {
            console.log(`  ⚠️ Опции не найдены`);
          }
          
          // Закрываем селект (клик вне его)
          await page.click('body');
        } catch (error) {
          console.log(`  ❌ Ошибка при проверке селекта: ${error.message}`);
        }
      }
    }
  });

  test('Проверка способов доставки', async ({ page }) => {
    // Ищем блок с способами доставки
    const deliverySection = page.locator('[class*="delivery"], [class*="shipping"], .delivery-methods, .shipping-options');
    
    if (await deliverySection.count() > 0) {
      console.log('🚚 Найден блок способов доставки');
      
      // Ищем радио-кнопки или чекбоксы доставки
      const deliveryOptions = page.locator('input[type="radio"][name*="delivery"], input[type="radio"][name*="shipping"], .delivery-option input');
      
      const optionCount = await deliveryOptions.count();
      console.log(`📦 Найдено способов доставки: ${optionCount}`);
      
      for (let i = 0; i < optionCount; i++) {
        const option = deliveryOptions.nth(i);
        if (await option.isVisible()) {
          const label = page.locator(`label[for="${await option.getAttribute('id')}"]`);
          const labelText = await label.textContent();
          console.log(`  ✅ ${labelText?.trim() || `Опция ${i + 1}`}`);
        }
      }
    } else {
      console.log('⚠️ Блок способов доставки не найден');
    }
  });

  test('Проверка способов оплаты', async ({ page }) => {
    // Ищем блок с способами оплаты
    const paymentSection = page.locator('[class*="payment"], [class*="pay"], .payment-methods, .payment-options');
    
    if (await paymentSection.count() > 0) {
      console.log('💳 Найден блок способов оплаты');
      
      // Ищем радио-кнопки или чекбоксы оплаты
      const paymentOptions = page.locator('input[type="radio"][name*="payment"], input[type="radio"][name*="pay"], .payment-option input');
      
      const optionCount = await paymentOptions.count();
      console.log(`💰 Найдено способов оплаты: ${optionCount}`);
      
      for (let i = 0; i < optionCount; i++) {
        const option = paymentOptions.nth(i);
        if (await option.isVisible()) {
          const label = page.locator(`label[for="${await option.getAttribute('id')}"]`);
          const labelText = await label.textContent();
          console.log(`  ✅ ${labelText?.trim() || `Опция ${i + 1}`}`);
        }
      }
    } else {
      console.log('⚠️ Блок способов оплаты не найден');
    }
  });

  test('Проверка валидации обязательных полей', async ({ page }) => {
    // Ищем кнопку отправки формы
    const submitButton = page.locator('button[type="submit"], input[type="submit"], .submit-btn, .order-btn, button:has-text("заказ"), button:has-text("оформить")');
    
    if (await submitButton.count() > 0) {
      const button = submitButton.first();
      console.log('🔘 Найдена кнопка отправки формы');
      
      // Пытаемся отправить пустую форму
      await button.click();
      
      // Ждем появления ошибок валидации
      await page.waitForTimeout(1000);
      
      // Ищем сообщения об ошибках
      const errorMessages = page.locator('.error, .invalid, .required, [class*="error"], [class*="invalid"], [class*="required"]');
      const errorCount = await errorMessages.count();
      
      if (errorCount > 0) {
        console.log(`⚠️ Найдено сообщений об ошибках: ${errorCount}`);
        for (let i = 0; i < Math.min(5, errorCount); i++) {
          const error = errorMessages.nth(i);
          const errorText = await error.textContent();
          if (errorText && errorText.trim()) {
            console.log(`  - ${errorText.trim()}`);
          }
        }
      } else {
        console.log('ℹ️ Сообщения об ошибках не найдены');
      }
    } else {
      console.log('⚠️ Кнопка отправки формы не найдена');
    }
  });

  test('Заполнение формы тестовыми данными', async ({ page }) => {
    // Заполняем поля личных данных
    const testData = {
      name: 'Тест',
      surname: 'Пользователь',
      phone: '+380671234567',
      email: 'test@example.com',
      city: 'Киев',
      address: 'ул. Тестовая, 1',
      postal: '01001'
    };

    // Заполняем имя
    const nameField = page.locator('input[name*="name"], input[placeholder*="ім\'я"], input[placeholder*="имя"]').first();
    if (await nameField.isVisible()) {
      await nameField.fill(testData.name);
      console.log('✅ Заполнено поле "Имя"');
    }

    // Заполняем фамилию
    const surnameField = page.locator('input[name*="surname"], input[placeholder*="прізвище"], input[placeholder*="фамилия"]').first();
    if (await surnameField.isVisible()) {
      await surnameField.fill(testData.surname);
      console.log('✅ Заполнено поле "Фамилия"');
    }

    // Заполняем телефон
    const phoneField = page.locator('input[name*="phone"], input[type="tel"], input[placeholder*="телефон"]').first();
    if (await phoneField.isVisible()) {
      await phoneField.fill(testData.phone);
      console.log('✅ Заполнено поле "Телефон"');
    }

    // Заполняем email
    const emailField = page.locator('input[name*="email"], input[type="email"], input[placeholder*="email"]').first();
    if (await emailField.isVisible()) {
      await emailField.fill(testData.email);
      console.log('✅ Заполнено поле "Email"');
    }

    // Заполняем город
    const cityField = page.locator('input[name*="city"], input[placeholder*="місто"], input[placeholder*="город"]').first();
    if (await cityField.isVisible()) {
      await cityField.fill(testData.city);
      console.log('✅ Заполнено поле "Город"');
    }

    // Заполняем адрес
    const addressField = page.locator('input[name*="address"], input[placeholder*="адреса"], textarea[name*="address"]').first();
    if (await addressField.isVisible()) {
      await addressField.fill(testData.address);
      console.log('✅ Заполнено поле "Адрес"');
    }

    // Заполняем почтовый индекс
    const postalField = page.locator('input[name*="postal"], input[name*="zip"], input[placeholder*="індекс"]').first();
    if (await postalField.isVisible()) {
      await postalField.fill(testData.postal);
      console.log('✅ Заполнено поле "Почтовый индекс"');
    }

    console.log('🎉 Заполнение формы завершено');
  });

  test('Проверка комментариев и дополнительных полей', async ({ page }) => {
    // Ищем поле для комментариев
    const commentField = page.locator('textarea[name*="comment"], textarea[name*="note"], textarea[placeholder*="комментар"], textarea[placeholder*="комментарий"]');
    
    if (await commentField.count() > 0) {
      console.log('💬 Найдено поле для комментариев');
      
      const comment = commentField.first();
      await comment.fill('Тестовый комментарий к заказу');
      console.log('✅ Заполнено поле комментариев');
    } else {
      console.log('ℹ️ Поле для комментариев не найдено');
    }

    // Ищем чекбоксы согласия
    const agreementCheckboxes = page.locator('input[type="checkbox"][name*="agree"], input[type="checkbox"][name*="consent"], input[type="checkbox"][name*="terms"]');
    
    const checkboxCount = await agreementCheckboxes.count();
    if (checkboxCount > 0) {
      console.log(`📋 Найдено чекбоксов согласия: ${checkboxCount}`);
      
      for (let i = 0; i < checkboxCount; i++) {
        const checkbox = agreementCheckboxes.nth(i);
        if (await checkbox.isVisible()) {
          await checkbox.check();
          console.log(`✅ Отмечен чекбокс ${i + 1}`);
        }
      }
    } else {
      console.log('ℹ️ Чекбоксы согласия не найдены');
    }
  });

  test('Проверка итоговой суммы и деталей заказа', async ({ page }) => {
    // Ищем блок с итоговой информацией
    const summarySection = page.locator('[class*="summary"], [class*="total"], [class*="order-total"], .order-summary, .checkout-summary');
    
    if (await summarySection.count() > 0) {
      console.log('💰 Найден блок итоговой информации');
      
      // Ищем элементы с ценами
      const priceElements = page.locator('[class*="price"], [class*="cost"], .price, .total-price, [data-price]');
      const priceCount = await priceElements.count();
      
      if (priceCount > 0) {
        console.log(`💵 Найдено элементов с ценами: ${priceCount}`);
        
        for (let i = 0; i < Math.min(5, priceCount); i++) {
          const priceElement = priceElements.nth(i);
          const priceText = await priceElement.textContent();
          if (priceText && priceText.trim()) {
            console.log(`  - ${priceText.trim()}`);
          }
        }
      }
    } else {
      console.log('⚠️ Блок итоговой информации не найден');
    }
  });

  test('Проверка мобильной версии формы', async ({ page }) => {
    // Устанавливаем мобильный viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Перезагружаем страницу для применения мобильного вида
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log('📱 Проверка мобильной версии формы');
    
    // Проверяем, что основные поля видны на мобильном
    const nameField = page.locator('input[name*="name"], input[placeholder*="ім\'я"], input[placeholder*="имя"]').first();
    if (await nameField.isVisible()) {
      console.log('✅ Поле имени видимо на мобильном');
    }
    
    const phoneField = page.locator('input[name*="phone"], input[type="tel"]').first();
    if (await phoneField.isVisible()) {
      console.log('✅ Поле телефона видимо на мобильном');
    }
    
    // Проверяем кнопку отправки
    const submitButton = page.locator('button[type="submit"], .submit-btn').first();
    if (await submitButton.isVisible()) {
      console.log('✅ Кнопка отправки видима на мобильном');
    }
  });
});
