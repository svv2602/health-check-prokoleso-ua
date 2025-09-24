import { test, expect } from '@playwright/test';

/**
 * Детальный тест формы заказа с проверкой конкретных элементов
 * Основан на анализе реальной страницы https://prokoleso.ua/ua/checkout/
 */

test.describe('Детальная проверка формы заказа - Prokoleso.ua', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://prokoleso.ua/ua/checkout/');
    await page.waitForLoadState('networkidle');
  });

  test('Проверка наличия корзины и товаров', async ({ page }) => {
    // Проверяем, что корзина не пустая (если есть товары)
    const cartEmpty = page.locator('text=Кошик порожній, text=Корзина пуста, .cart-empty, .empty-cart');
    
    if (await cartEmpty.isVisible()) {
      console.log('🛒 Корзина пуста - тестируем с пустой корзиной');
      
      // Проверяем наличие ссылок на каталог
      const catalogLinks = page.locator('a[href*="catalog"], a[href*="каталог"], a:has-text("До каталогу")');
      const linkCount = await catalogLinks.count();
      
      if (linkCount > 0) {
        console.log(`📂 Найдено ссылок на каталог: ${linkCount}`);
        for (let i = 0; i < linkCount; i++) {
          const link = catalogLinks.nth(i);
          const linkText = await link.textContent();
          const linkHref = await link.getAttribute('href');
          console.log(`  - ${linkText?.trim()}: ${linkHref}`);
        }
      }
    } else {
      console.log('🛒 В корзине есть товары - тестируем форму заказа');
    }
  });

  test('Проверка полей формы заказа с конкретными селекторами', async ({ page }) => {
    console.log('🔍 Поиск полей формы заказа...');
    
    // Список возможных селекторов для полей формы
    const fieldSelectors = {
      // Поля имени
      firstName: [
        'input[name="first_name"]',
        'input[name="firstName"]',
        'input[name="name"]',
        'input[placeholder*="ім\'я"]',
        'input[placeholder*="имя"]',
        'input[placeholder*="Ім\'я"]',
        'input[placeholder*="Имя"]',
        '#first_name',
        '#firstName',
        '#name'
      ],
      
      // Поля фамилии
      lastName: [
        'input[name="last_name"]',
        'input[name="lastName"]',
        'input[name="surname"]',
        'input[placeholder*="прізвище"]',
        'input[placeholder*="фамилия"]',
        'input[placeholder*="Прізвище"]',
        'input[placeholder*="Фамилия"]',
        '#last_name',
        '#lastName',
        '#surname'
      ],
      
      // Поля телефона
      phone: [
        'input[name="phone"]',
        'input[name="telephone"]',
        'input[type="tel"]',
        'input[placeholder*="телефон"]',
        'input[placeholder*="Телефон"]',
        'input[placeholder*="+380"]',
        '#phone',
        '#telephone'
      ],
      
      // Поля email
      email: [
        'input[name="email"]',
        'input[type="email"]',
        'input[placeholder*="email"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="електронна пошта"]',
        '#email'
      ],
      
      // Поля города
      city: [
        'input[name="city"]',
        'input[name="town"]',
        'input[placeholder*="місто"]',
        'input[placeholder*="город"]',
        'input[placeholder*="Місто"]',
        'input[placeholder*="Город"]',
        'select[name="city"]',
        '#city',
        '#town'
      ],
      
      // Поля адреса
      address: [
        'input[name="address"]',
        'input[name="street"]',
        'textarea[name="address"]',
        'input[placeholder*="адреса"]',
        'input[placeholder*="адрес"]',
        'input[placeholder*="Адреса"]',
        'input[placeholder*="Адрес"]',
        '#address',
        '#street'
      ],
      
      // Поля почтового индекса
      postal: [
        'input[name="postal"]',
        'input[name="zip"]',
        'input[name="postcode"]',
        'input[placeholder*="індекс"]',
        'input[placeholder*="индекс"]',
        'input[placeholder*="поштовий індекс"]',
        'input[placeholder*="почтовый индекс"]',
        '#postal',
        '#zip',
        '#postcode'
      ]
    };

    // Проверяем каждое поле
    for (const [fieldName, selectors] of Object.entries(fieldSelectors)) {
      let fieldFound = false;
      
      for (const selector of selectors) {
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.first().isVisible()) {
          console.log(`✅ Поле "${fieldName}" найдено: ${selector}`);
          fieldFound = true;
          break;
        }
      }
      
      if (!fieldFound) {
        console.log(`⚠️ Поле "${fieldName}" не найдено`);
      }
    }
  });

  test('Проверка селектов и выпадающих списков', async ({ page }) => {
    console.log('📋 Поиск селектов и выпадающих списков...');
    
    // Ищем все возможные селекты
    const selectSelectors = [
      'select',
      '[role="combobox"]',
      '.select',
      '.dropdown',
      '.custom-select',
      '.form-select',
      '[data-select]',
      '.chosen-container',
      '.select2-container'
    ];
    
    let totalSelects = 0;
    
    for (const selector of selectSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`🔍 Найдено элементов "${selector}": ${count}`);
        totalSelects += count;
        
        // Проверяем первые несколько элементов
        for (let i = 0; i < Math.min(3, count); i++) {
          const element = elements.nth(i);
          if (await element.isVisible()) {
            const tagName = await element.evaluate(el => el.tagName);
            const className = await element.getAttribute('class');
            const id = await element.getAttribute('id');
            const name = await element.getAttribute('name');
            
            console.log(`  - ${tagName}${id ? `#${id}` : ''}${name ? `[name="${name}"]` : ''}${className ? `.${className.split(' ')[0]}` : ''}`);
            
            // Пытаемся найти опции
            try {
              await element.click();
              await page.waitForTimeout(300);
              
              const options = page.locator('option, [role="option"], .option, .dropdown-item, .select-option');
              const optionCount = await options.count();
              
              if (optionCount > 0) {
                console.log(`    📝 Опций найдено: ${optionCount}`);
                
                // Показываем первые несколько опций
                for (let j = 0; j < Math.min(3, optionCount); j++) {
                  const option = options.nth(j);
                  const optionText = await option.textContent();
                  if (optionText && optionText.trim()) {
                    console.log(`      - ${optionText.trim()}`);
                  }
                }
              }
              
              // Закрываем селект
              await page.keyboard.press('Escape');
            } catch (error) {
              console.log(`    ❌ Ошибка при проверке: ${error.message}`);
            }
          }
        }
      }
    }
    
    console.log(`📊 Всего найдено селектов: ${totalSelects}`);
  });

  test('Проверка способов доставки и оплаты', async ({ page }) => {
    console.log('🚚 Поиск способов доставки и оплаты...');
    
    // Ищем блоки с опциями
    const sections = [
      { name: 'Доставка', selectors: ['.delivery', '.shipping', '[class*="delivery"]', '[class*="shipping"]'] },
      { name: 'Оплата', selectors: ['.payment', '.pay', '[class*="payment"]', '[class*="pay"]'] }
    ];
    
    for (const section of sections) {
      let sectionFound = false;
      
      for (const selector of section.selectors) {
        const elements = page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          console.log(`✅ Найден блок "${section.name}": ${selector} (${count} элементов)`);
          sectionFound = true;
          
          // Ищем опции внутри блока
          const options = elements.locator('input[type="radio"], input[type="checkbox"], .option, .choice');
          const optionCount = await options.count();
          
          if (optionCount > 0) {
            console.log(`  📋 Найдено опций: ${optionCount}`);
            
            for (let i = 0; i < Math.min(5, optionCount); i++) {
              const option = options.nth(i);
              if (await option.isVisible()) {
                const optionText = await option.textContent();
                const optionType = await option.getAttribute('type');
                const optionName = await option.getAttribute('name');
                
                console.log(`    - ${optionText?.trim() || `Опция ${i + 1}`} (${optionType || 'элемент'})`);
              }
            }
          }
        }
      }
      
      if (!sectionFound) {
        console.log(`⚠️ Блок "${section.name}" не найден`);
      }
    }
  });

  test('Проверка валидации и обязательных полей', async ({ page }) => {
    console.log('✅ Проверка валидации формы...');
    
    // Ищем кнопку отправки
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      '.submit-btn',
      '.order-btn',
      'button:has-text("заказ")',
      'button:has-text("оформить")',
      'button:has-text("підтвердити")',
      'button:has-text("подтвердить")',
      'button:has-text("відправити")',
      'button:has-text("отправить")'
    ];
    
    let submitButton = null;
    
    for (const selector of submitSelectors) {
      const button = page.locator(selector);
      if (await button.count() > 0 && await button.first().isVisible()) {
        submitButton = button.first();
        console.log(`🔘 Найдена кнопка отправки: ${selector}`);
        break;
      }
    }
    
    if (submitButton) {
      // Пытаемся отправить пустую форму
      console.log('📤 Попытка отправки пустой формы...');
      await submitButton.click();
      
      // Ждем появления ошибок
      await page.waitForTimeout(1000);
      
      // Ищем сообщения об ошибках
      const errorSelectors = [
        '.error',
        '.invalid',
        '.required',
        '[class*="error"]',
        '[class*="invalid"]',
        '[class*="required"]',
        '.field-error',
        '.validation-error',
        '.form-error'
      ];
      
      let totalErrors = 0;
      
      for (const selector of errorSelectors) {
        const errors = page.locator(selector);
        const count = await errors.count();
        
        if (count > 0) {
          console.log(`⚠️ Найдено ошибок "${selector}": ${count}`);
          totalErrors += count;
          
          // Показываем первые несколько ошибок
          for (let i = 0; i < Math.min(3, count); i++) {
            const error = errors.nth(i);
            const errorText = await error.textContent();
            if (errorText && errorText.trim()) {
              console.log(`  - ${errorText.trim()}`);
            }
          }
        }
      }
      
      if (totalErrors === 0) {
        console.log('ℹ️ Сообщения об ошибках не найдены');
      } else {
        console.log(`📊 Всего найдено ошибок: ${totalErrors}`);
      }
    } else {
      console.log('⚠️ Кнопка отправки формы не найдена');
    }
  });

  test('Заполнение формы тестовыми данными', async ({ page }) => {
    console.log('📝 Заполнение формы тестовыми данными...');
    
    const testData = {
      firstName: 'Тест',
      lastName: 'Пользователь',
      phone: '+380671234567',
      email: 'test@example.com',
      city: 'Киев',
      address: 'ул. Тестовая, 1',
      postal: '01001',
      comment: 'Тестовый заказ для проверки формы'
    };
    
    // Функция для заполнения поля
    const fillField = async (selectors: string[], value: string, fieldName: string) => {
      for (const selector of selectors) {
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.first().isVisible()) {
          await element.first().fill(value);
          console.log(`✅ Заполнено поле "${fieldName}": ${value}`);
          return true;
        }
      }
      console.log(`⚠️ Поле "${fieldName}" не найдено`);
      return false;
    };
    
    // Заполняем поля
    await fillField(['input[name="first_name"]', 'input[name="firstName"]', 'input[name="name"]'], testData.firstName, 'Имя');
    await fillField(['input[name="last_name"]', 'input[name="lastName"]', 'input[name="surname"]'], testData.lastName, 'Фамилия');
    await fillField(['input[name="phone"]', 'input[type="tel"]'], testData.phone, 'Телефон');
    await fillField(['input[name="email"]', 'input[type="email"]'], testData.email, 'Email');
    await fillField(['input[name="city"]', 'select[name="city"]'], testData.city, 'Город');
    await fillField(['input[name="address"]', 'textarea[name="address"]'], testData.address, 'Адрес');
    await fillField(['input[name="postal"]', 'input[name="zip"]'], testData.postal, 'Почтовый индекс');
    
    // Заполняем комментарий
    await fillField(['textarea[name="comment"]', 'textarea[name="note"]', 'textarea[placeholder*="комментар"]'], testData.comment, 'Комментарий');
    
    console.log('🎉 Заполнение формы завершено');
  });

  test('Проверка итоговой информации и цен', async ({ page }) => {
    console.log('💰 Поиск итоговой информации...');
    
    // Ищем элементы с ценами и суммами
    const priceSelectors = [
      '.price',
      '.cost',
      '.total',
      '.sum',
      '[class*="price"]',
      '[class*="cost"]',
      '[class*="total"]',
      '[data-price]',
      '[data-cost]',
      '[data-total]'
    ];
    
    let totalPrices = 0;
    
    for (const selector of priceSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`💵 Найдено элементов с ценами "${selector}": ${count}`);
        totalPrices += count;
        
        // Показываем первые несколько цен
        for (let i = 0; i < Math.min(3, count); i++) {
          const element = elements.nth(i);
          const priceText = await element.textContent();
          if (priceText && priceText.trim()) {
            console.log(`  - ${priceText.trim()}`);
          }
        }
      }
    }
    
    console.log(`📊 Всего найдено элементов с ценами: ${totalPrices}`);
    
    // Ищем блоки с итоговой информацией
    const summarySelectors = [
      '.order-summary',
      '.checkout-summary',
      '.cart-summary',
      '[class*="summary"]',
      '[class*="total"]',
      '.order-total',
      '.checkout-total'
    ];
    
    for (const selector of summarySelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`📋 Найден блок итоговой информации: ${selector} (${count} элементов)`);
      }
    }
  });

  test('Проверка мобильной адаптивности', async ({ page }) => {
    console.log('📱 Проверка мобильной адаптивности...');
    
    // Тестируем разные размеры экрана
    const viewports = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1024, height: 768, name: 'iPad Landscape' }
    ];
    
    for (const viewport of viewports) {
      console.log(`\n📱 Тестирование ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Проверяем основные элементы
      const nameField = page.locator('input[name*="name"], input[placeholder*="ім\'я"], input[placeholder*="имя"]').first();
      const phoneField = page.locator('input[name*="phone"], input[type="tel"]').first();
      const submitButton = page.locator('button[type="submit"], .submit-btn').first();
      
      const checks = [
        { element: nameField, name: 'Поле имени' },
        { element: phoneField, name: 'Поле телефона' },
        { element: submitButton, name: 'Кнопка отправки' }
      ];
      
      for (const check of checks) {
        if (await check.element.isVisible()) {
          console.log(`  ✅ ${check.name} видимо`);
        } else {
          console.log(`  ⚠️ ${check.name} не видимо`);
        }
      }
    }
  });
});
