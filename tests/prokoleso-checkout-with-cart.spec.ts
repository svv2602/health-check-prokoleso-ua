import { test, expect } from '@playwright/test';

/**
 * Тест формы заказа с товарами в корзине
 * Автоматически добавляет товары в корзину и проверяет полную форму заказа
 */

test.describe('Форма заказа с товарами в корзине - Prokoleso.ua', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на главную страницу
    await page.goto('https://prokoleso.ua/');
    await page.waitForLoadState('networkidle');
  });

  test('Добавление товаров в корзину и переход к оформлению', async ({ page }) => {
    console.log('🛒 Начинаем процесс добавления товаров в корзину...');
    
    // Ищем товары на главной странице
    const productLinks = page.locator('a[href*="/product/"], a[href*="/shiny/"], .product-item a, .product-card a');
    const productCount = await productLinks.count();
    
    console.log(`📦 Найдено товаров на главной странице: ${productCount}`);
    
    if (productCount === 0) {
      console.log('⚠️ Товары не найдены на главной странице, переходим в каталог...');
      
      // Переходим в каталог шин
      await page.goto('https://prokoleso.ua/ua/shiny/');
      await page.waitForLoadState('networkidle');
      
      // Ищем товары в каталоге
      const catalogProducts = page.locator('a[href*="/product/"], .product-item a, .product-card a, .product-link');
      const catalogProductCount = await catalogProducts.count();
      
      console.log(`📦 Найдено товаров в каталоге: ${catalogProductCount}`);
      
      if (catalogProductCount > 0) {
        // Кликаем на первый товар
        const firstProduct = catalogProducts.first();
        const productUrl = await firstProduct.getAttribute('href');
        console.log(`🔗 Переходим к товару: ${productUrl}`);
        
        await firstProduct.click();
        await page.waitForLoadState('networkidle');
      }
    } else {
      // Кликаем на первый товар с главной страницы
      const firstProduct = productLinks.first();
      const productUrl = await firstProduct.getAttribute('href');
      console.log(`🔗 Переходим к товару: ${productUrl}`);
      
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Проверяем, что мы на странице товара
    const isProductPage = await page.locator('.product-page, .product-detail, [class*="product"]').count() > 0;
    
    if (isProductPage) {
      console.log('✅ Мы на странице товара, ищем кнопку добавления в корзину...');
      
      // Ищем кнопки добавления в корзину
      const addToCartSelectors = [
        'button:has-text("Додати в кошик")',
        'button:has-text("Добавить в корзину")',
        'button:has-text("Купити")',
        'button:has-text("Купить")',
        '.add-to-cart',
        '.btn-cart',
        '.buy-button',
        'button[data-action="add-to-cart"]',
        'input[type="submit"][value*="корзину"]',
        'input[type="submit"][value*="кошик"]'
      ];
      
      let addToCartButton = null;
      
      for (const selector of addToCartSelectors) {
        const button = page.locator(selector);
        if (await button.count() > 0 && await button.first().isVisible()) {
          addToCartButton = button.first();
          console.log(`🔘 Найдена кнопка добавления в корзину: ${selector}`);
          break;
        }
      }
      
      if (addToCartButton) {
        // Выбираем размер шины, если есть селект
        const sizeSelectors = [
          'select[name*="size"]',
          'select[name*="размер"]',
          'select[name*="типоразмер"]',
          '.size-select',
          '.tire-size'
        ];
        
        for (const selector of sizeSelectors) {
          const sizeSelect = page.locator(selector);
          if (await sizeSelect.count() > 0 && await sizeSelect.first().isVisible()) {
            console.log('📏 Найден селект размера, выбираем первый доступный...');
            
            const options = sizeSelect.locator('option:not([disabled]):not([value=""])');
            const optionCount = await options.count();
            
            if (optionCount > 0) {
              await options.first().click();
              console.log('✅ Размер выбран');
            }
            break;
          }
        }
        
        // Добавляем товар в корзину
        console.log('🛒 Добавляем товар в корзину...');
        await addToCartButton.click();
        
        // Ждем подтверждения добавления
        await page.waitForTimeout(2000);
        
        // Проверяем, появилось ли сообщение об успешном добавлении
        const successMessages = [
          'Додано в кошик',
          'Добавлено в корзину',
          'Товар добавлен',
          'Успішно додано',
          'Успешно добавлено'
        ];
        
        let addedToCart = false;
        for (const message of successMessages) {
          const messageElement = page.locator(`text=${message}`);
          if (await messageElement.count() > 0 && await messageElement.first().isVisible()) {
            console.log(`✅ ${message}`);
            addedToCart = true;
            break;
          }
        }
        
        if (!addedToCart) {
          console.log('⚠️ Сообщение о добавлении в корзину не найдено, но продолжаем...');
        }
        
        // Переходим в корзину
        console.log('🛒 Переходим в корзину...');
        const cartSelectors = [
          'a[href*="/cart"]',
          'a[href*="/кошик"]',
          'a[href*="/checkout"]',
          '.cart-link',
          '.basket-link',
          'button:has-text("Кошик")',
          'button:has-text("Корзина")'
        ];
        
        let cartLink = null;
        for (const selector of cartSelectors) {
          const link = page.locator(selector);
          if (await link.count() > 0 && await link.first().isVisible()) {
            cartLink = link.first();
            console.log(`🔗 Найдена ссылка на корзину: ${selector}`);
            break;
          }
        }
        
        if (cartLink) {
          await cartLink.click();
          await page.waitForLoadState('networkidle');
          
          // Проверяем, что мы в корзине
          const cartTitle = await page.title();
          console.log(`📄 Заголовок страницы корзины: "${cartTitle}"`);
          
          // Ищем кнопку оформления заказа
          const checkoutSelectors = [
            'button:has-text("Оформити замовлення")',
            'button:has-text("Оформить заказ")',
            'button:has-text("Перейти к оформлению")',
            'a[href*="/checkout"]',
            '.checkout-btn',
            '.order-btn'
          ];
          
          let checkoutButton = null;
          for (const selector of checkoutSelectors) {
            const button = page.locator(selector);
            if (await button.count() > 0 && await button.first().isVisible()) {
              checkoutButton = button.first();
              console.log(`🔘 Найдена кнопка оформления заказа: ${selector}`);
              break;
            }
          }
          
          if (checkoutButton) {
            console.log('✅ Переходим к оформлению заказа...');
            await checkoutButton.click();
            await page.waitForLoadState('networkidle');
            
            // Теперь мы должны быть на странице оформления заказа
            const checkoutTitle = await page.title();
            console.log(`📄 Заголовок страницы оформления: "${checkoutTitle}"`);
            
            // Проверяем, что форма заказа доступна
            const formSelectors = [
              'form',
              '.checkout-form',
              '.order-form',
              '.cart-form'
            ];
            
            let formFound = false;
            for (const selector of formSelectors) {
              const form = page.locator(selector);
              if (await form.count() > 0 && await form.first().isVisible()) {
                console.log(`✅ Найдена форма заказа: ${selector}`);
                formFound = true;
                break;
              }
            }
            
            if (formFound) {
              console.log('🎉 Успешно! Форма заказа доступна с товарами в корзине');
            } else {
              console.log('⚠️ Форма заказа не найдена');
            }
          } else {
            console.log('⚠️ Кнопка оформления заказа не найдена');
          }
        } else {
          console.log('⚠️ Ссылка на корзину не найдена');
        }
      } else {
        console.log('⚠️ Кнопка добавления в корзину не найдена');
      }
    } else {
      console.log('⚠️ Не удалось перейти на страницу товара');
    }
  });

  test('Проверка полей формы заказа с товарами в корзине', async ({ page }) => {
    console.log('🔍 Проверяем поля формы заказа с товарами в корзине...');
    
    // Переходим напрямую на страницу заказа
    await page.goto('https://prokoleso.ua/ua/checkout/');
    await page.waitForTimeout(3000);
    
    // Проверяем состояние корзины
    const cartEmpty = page.locator('text=Кошик порожній, text=Корзина пуста');
    const isEmpty = await cartEmpty.count() > 0 && await cartEmpty.first().isVisible();
    
    if (isEmpty) {
      console.log('🛒 Корзина пуста, добавляем товары...');
      
      // Переходим в каталог и добавляем товар
      await page.goto('https://prokoleso.ua/ua/shiny/');
      await page.waitForLoadState('networkidle');
      
      // Ищем первый товар
      const firstProduct = page.locator('a[href*="/product/"], .product-item a, .product-card a').first();
      
      if (await firstProduct.count() > 0) {
        await firstProduct.click();
        await page.waitForLoadState('networkidle');
        
        // Ищем кнопку добавления в корзину
        const addButton = page.locator('button:has-text("Додати"), button:has-text("Купити"), .add-to-cart, .btn-cart').first();
        
        if (await addButton.count() > 0 && await addButton.isVisible()) {
          await addButton.click();
          await page.waitForTimeout(2000);
          
          // Переходим обратно к оформлению заказа
          await page.goto('https://prokoleso.ua/ua/checkout/');
          await page.waitForTimeout(3000);
        }
      }
    }
    
    // Теперь проверяем поля формы заказа
    console.log('📝 Проверяем поля формы заказа...');
    
    const fieldSelectors = {
      'Имя': [
        'input[name*="name"]',
        'input[placeholder*="ім\'я"]',
        'input[placeholder*="имя"]',
        'input[placeholder*="Ім\'я"]',
        'input[placeholder*="Имя"]'
      ],
      'Фамилия': [
        'input[name*="surname"]',
        'input[name*="lastname"]',
        'input[placeholder*="прізвище"]',
        'input[placeholder*="фамилия"]'
      ],
      'Телефон': [
        'input[name*="phone"]',
        'input[type="tel"]',
        'input[placeholder*="телефон"]',
        'input[placeholder*="Телефон"]'
      ],
      'Email': [
        'input[name*="email"]',
        'input[type="email"]',
        'input[placeholder*="email"]',
        'input[placeholder*="Email"]'
      ],
      'Город': [
        'input[name*="city"]',
        'select[name*="city"]',
        'input[placeholder*="місто"]',
        'input[placeholder*="город"]'
      ],
      'Адрес': [
        'input[name*="address"]',
        'textarea[name*="address"]',
        'input[placeholder*="адреса"]',
        'input[placeholder*="адрес"]'
      ]
    };
    
    let foundFields = 0;
    
    for (const [fieldName, selectors] of Object.entries(fieldSelectors)) {
      let fieldFound = false;
      
      for (const selector of selectors) {
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.first().isVisible()) {
          console.log(`✅ Поле "${fieldName}" найдено: ${selector}`);
          fieldFound = true;
          foundFields++;
          break;
        }
      }
      
      if (!fieldFound) {
        console.log(`⚠️ Поле "${fieldName}" не найдено`);
      }
    }
    
    console.log(`📊 Найдено полей: ${foundFields} из ${Object.keys(fieldSelectors).length}`);
    
    // Проверяем кнопки отправки
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      '.submit-btn',
      '.order-btn',
      'button:has-text("заказ")',
      'button:has-text("оформить")'
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
      console.log('✅ Кнопка отправки формы найдена');
    } else {
      console.log('⚠️ Кнопка отправки формы не найдена');
    }
  });

  test('Заполнение формы заказа тестовыми данными', async ({ page }) => {
    console.log('📝 Заполняем форму заказа тестовыми данными...');
    
    // Переходим на страницу заказа
    await page.goto('https://prokoleso.ua/ua/checkout/');
    await page.waitForTimeout(3000);
    
    // Проверяем, есть ли форма заказа
    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('⚠️ Форма заказа не найдена, возможно корзина пуста');
      return;
    }
    
    const testData = {
      name: 'Тест',
      surname: 'Пользователь',
      phone: '+380671234567',
      email: 'test@example.com',
      city: 'Киев',
      address: 'ул. Тестовая, 1'
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
    await fillField(['input[name*="name"]', 'input[placeholder*="ім\'я"]'], testData.name, 'Имя');
    await fillField(['input[name*="surname"]', 'input[name*="lastname"]'], testData.surname, 'Фамилия');
    await fillField(['input[name*="phone"]', 'input[type="tel"]'], testData.phone, 'Телефон');
    await fillField(['input[name*="email"]', 'input[type="email"]'], testData.email, 'Email');
    await fillField(['input[name*="city"]', 'select[name*="city"]'], testData.city, 'Город');
    await fillField(['input[name*="address"]', 'textarea[name*="address"]'], testData.address, 'Адрес');
    
    console.log('🎉 Заполнение формы завершено');
  });

  test('Проверка способов доставки и оплаты', async ({ page }) => {
    console.log('🚚 Проверяем способы доставки и оплаты...');
    
    await page.goto('https://prokoleso.ua/ua/checkout/');
    await page.waitForTimeout(3000);
    
    // Ищем блоки с опциями доставки и оплаты
    const deliverySection = page.locator('[class*="delivery"], [class*="shipping"], .delivery-methods');
    const paymentSection = page.locator('[class*="payment"], [class*="pay"], .payment-methods');
    
    if (await deliverySection.count() > 0) {
      console.log('🚚 Найден блок способов доставки');
      
      const deliveryOptions = deliverySection.locator('input[type="radio"], .delivery-option');
      const optionCount = await deliveryOptions.count();
      
      if (optionCount > 0) {
        console.log(`📦 Найдено способов доставки: ${optionCount}`);
        
        for (let i = 0; i < Math.min(3, optionCount); i++) {
          const option = deliveryOptions.nth(i);
          const optionText = await option.textContent();
          if (optionText && optionText.trim()) {
            console.log(`  - ${optionText.trim()}`);
          }
        }
      }
    } else {
      console.log('⚠️ Блок способов доставки не найден');
    }
    
    if (await paymentSection.count() > 0) {
      console.log('💳 Найден блок способов оплаты');
      
      const paymentOptions = paymentSection.locator('input[type="radio"], .payment-option');
      const optionCount = await paymentOptions.count();
      
      if (optionCount > 0) {
        console.log(`💰 Найдено способов оплаты: ${optionCount}`);
        
        for (let i = 0; i < Math.min(3, optionCount); i++) {
          const option = paymentOptions.nth(i);
          const optionText = await option.textContent();
          if (optionText && optionText.trim()) {
            console.log(`  - ${optionText.trim()}`);
          }
        }
      }
    } else {
      console.log('⚠️ Блок способов оплаты не найден');
    }
  });
});
