import { test, expect } from '@playwright/test';

/**
 * Симуляция тестирования формы заказа с товарами
 * Использует различные подходы для добавления товаров в корзину
 */

test.describe('Симуляция формы заказа с товарами - Prokoleso.ua', () => {
  
  test('Проверка доступности каталога товаров', async ({ page }) => {
    console.log('📦 Проверяем доступность каталога товаров...');
    
    // Переходим в каталог шин
    await page.goto('https://prokoleso.ua/ua/shiny/');
    await page.waitForLoadState('networkidle');
    
    // Проверяем заголовок страницы
    const title = await page.title();
    console.log(`📄 Заголовок каталога: "${title}"`);
    
    // Ищем товары в каталоге
    const productSelectors = [
      '.product-item',
      '.product-card',
      '.product',
      '[class*="product"]',
      'a[href*="/product/"]',
      '.tire-item',
      '.tire-card'
    ];
    
    let totalProducts = 0;
    for (const selector of productSelectors) {
      const products = page.locator(selector);
      const count = await products.count();
      if (count > 0) {
        console.log(`📦 Найдено товаров "${selector}": ${count}`);
        totalProducts += count;
      }
    }
    
    console.log(`📊 Всего найдено товаров: ${totalProducts}`);
    
    if (totalProducts > 0) {
      console.log('✅ Каталог товаров доступен');
      
      // Показываем первые несколько товаров
      const firstProducts = page.locator('.product-item, .product-card, .product').first();
      if (await firstProducts.count() > 0) {
        const productText = await firstProducts.textContent();
        console.log(`🔍 Первый товар: ${productText?.trim().substring(0, 100)}...`);
      }
    } else {
      console.log('⚠️ Товары в каталоге не найдены');
    }
  });

  test('Поиск конкретных товаров для добавления в корзину', async ({ page }) => {
    console.log('🔍 Ищем конкретные товары для добавления в корзину...');
    
    // Переходим в каталог
    await page.goto('https://prokoleso.ua/ua/shiny/');
    await page.waitForLoadState('networkidle');
    
    // Ищем ссылки на товары
    const productLinks = page.locator('a[href*="/product/"], .product-item a, .product-card a');
    const linkCount = await productLinks.count();
    
    console.log(`🔗 Найдено ссылок на товары: ${linkCount}`);
    
    if (linkCount > 0) {
      // Собираем информацию о первых 5 товарах
      const productInfo = [];
      
      for (let i = 0; i < Math.min(5, linkCount); i++) {
        const link = productLinks.nth(i);
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        if (href && text) {
          productInfo.push({
            url: href.startsWith('http') ? href : `https://prokoleso.ua${href}`,
            title: text.trim(),
            index: i
          });
        }
      }
      
      console.log('📋 Найденные товары:');
      for (const product of productInfo) {
        console.log(`  ${product.index + 1}. ${product.title}`);
        console.log(`     URL: ${product.url}`);
      }
      
      // Переходим к первому товару
      if (productInfo.length > 0) {
        const firstProduct = productInfo[0];
        console.log(`\n🔗 Переходим к товару: ${firstProduct.title}`);
        
        await page.goto(firstProduct.url);
        await page.waitForLoadState('networkidle');
        
        // Проверяем, что мы на странице товара
        const productTitle = await page.title();
        console.log(`📄 Заголовок страницы товара: "${productTitle}"`);
        
        // Ищем информацию о товаре
        const productDetails = page.locator('.product-title, .product-name, h1, .tire-title');
        if (await productDetails.count() > 0) {
          const productName = await productDetails.first().textContent();
          console.log(`📦 Название товара: ${productName?.trim()}`);
        }
        
        // Ищем цену товара
        const priceSelectors = [
          '.price',
          '.product-price',
          '.tire-price',
          '[class*="price"]',
          '.cost',
          '.value'
        ];
        
        for (const selector of priceSelectors) {
          const priceElement = page.locator(selector);
          if (await priceElement.count() > 0) {
            const price = await priceElement.first().textContent();
            if (price && price.trim()) {
              console.log(`💰 Цена товара: ${price.trim()}`);
              break;
            }
          }
        }
        
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
          'input[type="submit"][value*="кошик"]',
          'button:has-text("В кошик")',
          'button:has-text("В корзину")'
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
          console.log('✅ Кнопка добавления в корзину найдена');
          
          // Проверяем, есть ли селекты для выбора параметров
          const sizeSelectors = [
            'select[name*="size"]',
            'select[name*="размер"]',
            'select[name*="типоразмер"]',
            '.size-select',
            '.tire-size',
            'select[name*="diameter"]',
            'select[name*="ширина"]'
          ];
          
          for (const selector of sizeSelectors) {
            const sizeSelect = page.locator(selector);
            if (await sizeSelect.count() > 0 && await sizeSelect.first().isVisible()) {
              console.log(`📏 Найден селект размера: ${selector}`);
              
              // Пытаемся выбрать первый доступный вариант
              const options = sizeSelect.locator('option:not([disabled]):not([value=""])');
              const optionCount = await options.count();
              
              if (optionCount > 0) {
                const firstOption = options.first();
                const optionText = await firstOption.textContent();
                console.log(`📏 Выбираем размер: ${optionText?.trim()}`);
                
                await firstOption.click();
                await page.waitForTimeout(500);
              }
              break;
            }
          }
          
          // Пытаемся добавить товар в корзину
          console.log('🛒 Пытаемся добавить товар в корзину...');
          
          try {
            await addToCartButton.click();
            await page.waitForTimeout(2000);
            
            // Проверяем, появилось ли сообщение об успешном добавлении
            const successMessages = [
              'Додано в кошик',
              'Добавлено в корзину',
              'Товар добавлен',
              'Успішно додано',
              'Успешно добавлено',
              'Товар у кошику',
              'Товар в корзине'
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
              console.log('⚠️ Сообщение о добавлении в корзину не найдено');
            }
            
          } catch (error) {
            console.log(`❌ Ошибка при добавлении в корзину: ${error.message}`);
          }
        } else {
          console.log('⚠️ Кнопка добавления в корзину не найдена');
        }
      }
    } else {
      console.log('⚠️ Ссылки на товары не найдены');
    }
  });

  test('Проверка корзины после добавления товаров', async ({ page }) => {
    console.log('🛒 Проверяем состояние корзины...');
    
    // Переходим на страницу корзины/оформления заказа
    await page.goto('https://prokoleso.ua/ua/checkout/');
    await page.waitForTimeout(3000);
    
    // Проверяем заголовок страницы
    const title = await page.title();
    console.log(`📄 Заголовок страницы: "${title}"`);
    
    // Ищем сообщения о состоянии корзины
    const cartMessages = [
      'Кошик порожній',
      'Корзина пуста',
      'Ваш кошик порожній',
      'Ваша корзина пуста',
      'Додайте товари',
      'Добавьте товары'
    ];
    
    let cartEmpty = false;
    for (const message of cartMessages) {
      const messageElement = page.locator(`text=${message}`);
      if (await messageElement.count() > 0 && await messageElement.first().isVisible()) {
        console.log(`⚠️ Найдено сообщение: "${message}"`);
        cartEmpty = true;
        break;
      }
    }
    
    if (cartEmpty) {
      console.log('🛒 Корзина пуста - предлагаем добавить товары');
      
      // Ищем ссылки на каталог
      const catalogLinks = page.locator('a[href*="/shiny/"], a[href*="/catalog/"], a:has-text("До каталогу"), a:has-text("В каталог")');
      const linkCount = await catalogLinks.count();
      
      if (linkCount > 0) {
        console.log(`📂 Найдено ссылок на каталог: ${linkCount}`);
        
        for (let i = 0; i < Math.min(3, linkCount); i++) {
          const link = catalogLinks.nth(i);
          const linkText = await link.textContent();
          const linkHref = await link.getAttribute('href');
          console.log(`  - ${linkText?.trim()}: ${linkHref}`);
        }
      }
    } else {
      console.log('🛒 В корзине есть товары - проверяем форму заказа');
      
      // Ищем форму заказа
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
        console.log('🎉 Форма заказа доступна!');
        
        // Ищем поля формы
        const inputFields = page.locator('input[type="text"], input[type="email"], input[type="tel"], textarea, select');
        const fieldCount = await inputFields.count();
        
        console.log(`📝 Найдено полей ввода: ${fieldCount}`);
        
        // Ищем кнопки отправки
        const submitButtons = page.locator('button[type="submit"], input[type="submit"], .submit-btn, .order-btn');
        const buttonCount = await submitButtons.count();
        
        console.log(`🔘 Найдено кнопок отправки: ${buttonCount}`);
      } else {
        console.log('⚠️ Форма заказа не найдена');
      }
    }
  });

  test('Создание тестового сценария с товарами', async ({ page }) => {
    console.log('🧪 Создаем тестовый сценарий с товарами...');
    
    // Сценарий 1: Переход в каталог
    console.log('\n📋 Сценарий 1: Переход в каталог товаров');
    await page.goto('https://prokoleso.ua/ua/shiny/');
    await page.waitForLoadState('networkidle');
    
    const catalogTitle = await page.title();
    console.log(`✅ Перешли в каталог: "${catalogTitle}"`);
    
    // Сценарий 2: Поиск товаров
    console.log('\n📋 Сценарий 2: Поиск товаров');
    const products = page.locator('.product-item, .product-card, a[href*="/product/"]');
    const productCount = await products.count();
    console.log(`✅ Найдено товаров: ${productCount}`);
    
    if (productCount > 0) {
      // Сценарий 3: Переход к товару
      console.log('\n📋 Сценарий 3: Переход к товару');
      const firstProduct = products.first();
      const productUrl = await firstProduct.getAttribute('href');
      
      if (productUrl) {
        const fullUrl = productUrl.startsWith('http') ? productUrl : `https://prokoleso.ua${productUrl}`;
        console.log(`✅ Переходим к товару: ${fullUrl}`);
        
        await page.goto(fullUrl);
        await page.waitForLoadState('networkidle');
        
        const productTitle = await page.title();
        console.log(`✅ Страница товара: "${productTitle}"`);
        
        // Сценарий 4: Поиск кнопки добавления в корзину
        console.log('\n📋 Сценарий 4: Поиск кнопки добавления в корзину');
        const addButtons = page.locator('button:has-text("Додати"), button:has-text("Купити"), .add-to-cart, .btn-cart');
        const buttonCount = await addButtons.count();
        console.log(`✅ Найдено кнопок добавления: ${buttonCount}`);
        
        if (buttonCount > 0) {
          console.log('✅ Кнопка добавления в корзину найдена - товар можно добавить');
        } else {
          console.log('⚠️ Кнопка добавления в корзину не найдена');
        }
      }
    }
    
    // Сценарий 5: Проверка корзины
    console.log('\n📋 Сценарий 5: Проверка корзины');
    await page.goto('https://prokoleso.ua/ua/checkout/');
    await page.waitForTimeout(3000);
    
    const checkoutTitle = await page.title();
    console.log(`✅ Страница оформления: "${checkoutTitle}"`);
    
    // Сценарий 6: Анализ доступных действий
    console.log('\n📋 Сценарий 6: Анализ доступных действий');
    
    const actions = {
      'Ссылки на каталог': await page.locator('a[href*="/shiny/"], a[href*="/catalog/"]').count(),
      'Формы': await page.locator('form').count(),
      'Поля ввода': await page.locator('input, textarea, select').count(),
      'Кнопки': await page.locator('button, input[type="submit"]').count(),
      'Изображения': await page.locator('img').count(),
      'Ссылки': await page.locator('a[href]').count()
    };
    
    console.log('📊 Статистика элементов на странице:');
    for (const [action, count] of Object.entries(actions)) {
      console.log(`  - ${action}: ${count}`);
    }
    
    console.log('\n🎯 Рекомендации для тестирования:');
    console.log('1. Добавить товары в корзину через каталог');
    console.log('2. Проверить все поля формы заказа');
    console.log('3. Протестировать валидацию полей');
    console.log('4. Проверить способы доставки и оплаты');
    console.log('5. Протестировать мобильную версию');
  });
});
