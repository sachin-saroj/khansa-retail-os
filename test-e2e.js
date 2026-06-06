const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CLIENT_URL = 'http://localhost:5173';
const SERVER_URL = 'http://localhost:5000/api';

const results = {
  phases: {},
  consoleErrors: [],
  networkFailures: [],
  apiFailures: []
};

// Helper: Delay
const delay = ms => new Promise(res => setTimeout(res, ms));

async function runTests() {
  console.log('=== Starting E2E Validation for Khansa Retail OS ===');
  
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set window size
  await page.setViewport({ width: 1280, height: 800 });

  // Listen for console logs
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      console.log(`[Browser Error] ${text}`);
      results.consoleErrors.push({
        text,
        location: msg.location()
      });
    }
  });

  // Listen for network failures/errors
  page.on('requestfailed', request => {
    console.log(`[Network Request Failed] ${request.url()} - ${request.failure().errorText}`);
    results.networkFailures.push({
      url: request.url(),
      errorText: request.failure().errorText
    });
  });

  page.on('response', async response => {
    const status = response.status();
    const url = response.url();
    if (url.includes('/api/') && status >= 400) {
      let bodyText = '';
      try {
        bodyText = await response.text();
      } catch (e) {}
      console.log(`[API Error Response] ${url} - Status ${status} - Body: ${bodyText}`);
      results.apiFailures.push({
        url,
        status,
        payload: bodyText
      });
    }
  });

  try {
    // PHASE 2 — AUTHENTICATION TESTING
    results.phases['Phase 2 - Authentication'] = { status: 'IN_PROGRESS' };
    
    // Test: Access Registration
    await page.goto(`${CLIENT_URL}/register`, { waitUntil: 'networkidle2' });
    console.log('Navigated to Registration Page');

    // Register a new user
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const testPhone = `900000${randomSuffix}`;
    await page.type('#register-shop-name', 'Test Automation Shop');
    await page.type('#register-owner-name', 'Test Proprietor');
    await page.type('#register-phone', testPhone);
    await page.type('#register-password', 'password123');
    await page.type('#register-confirm-password', 'password123');
    
    console.log(`Submitting registration for phone: ${testPhone}`);
    await page.click('#register-submit');
    await delay(5000);

    let currentUrl = page.url();
    console.log(`Current URL after registration: ${currentUrl}`);
    if (currentUrl.endsWith('/dashboard')) {
      console.log('Registration succeeded and navigated to Dashboard.');
      results.phases['Phase 2 - Authentication'].registration = 'PASS';
    } else {
      console.log('Registration failed to navigate to /dashboard.');
      results.phases['Phase 2 - Authentication'].registration = 'FAIL';
    }

    // Test: Logout
    console.log('Attempting logout...');
    const logoutBtn = await page.waitForSelector('aside button', { timeout: 5000 });
    const btnText = await page.evaluate(el => el.textContent, logoutBtn);
    console.log(`Found sidebar button text: "${btnText}"`);
    await logoutBtn.click();
    await delay(5000);
    
    currentUrl = page.url();
    console.log(`Current URL after logout: ${currentUrl}`);
    if (currentUrl.endsWith('/login')) {
      console.log('Logout succeeded and redirected to /login.');
      results.phases['Phase 2 - Authentication'].logout = 'PASS';
    } else {
      console.log('Logout failed to redirect.');
      results.phases['Phase 2 - Authentication'].logout = 'FAIL';
    }

    // Test: Protected route rejection
    console.log('Attempting to access /dashboard while unauthenticated...');
    await page.goto(`${CLIENT_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await delay(1000);
    currentUrl = page.url();
    console.log(`URL after navigating directly to /dashboard: ${currentUrl}`);
    if (currentUrl.endsWith('/login')) {
      console.log('Protected route correctly rejected and redirected to /login.');
      results.phases['Phase 2 - Authentication'].protectedRoutes = 'PASS';
    } else {
      console.log('Protected route failed to redirect to /login.');
      results.phases['Phase 2 - Authentication'].protectedRoutes = 'FAIL';
    }

    // Test: Invalid Login
    console.log('Testing Invalid Login...');
    await page.type('#login-phone', testPhone);
    await page.type('#login-password', 'wrong_password');
    await page.click('#login-submit');
    await delay(1000);
    let errorBox = await page.evaluate(() => {
      const card = document.querySelector('.card');
      if (!card) return null;
      const divs = Array.from(card.querySelectorAll('div'));
      const errDiv = divs.find(d => d.className.includes('bg-danger'));
      return errDiv ? errDiv.innerText : null;
    });
    console.log(`Invalid login error message: "${errorBox}"`);
    if (errorBox && errorBox.includes('INVALID PHONE')) {
      results.phases['Phase 2 - Authentication'].invalidLogin = 'PASS';
    } else {
      results.phases['Phase 2 - Authentication'].invalidLogin = 'FAIL';
    }

    // Test: Valid Login
    console.log('Testing Valid Login...');
    // Clear inputs first
    await page.click('#login-phone', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#login-phone', testPhone);
    await page.click('#login-password', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('#login-password', 'password123');
    await page.click('#login-submit');
    await delay(5000);
    currentUrl = page.url();
    console.log(`URL after valid login: ${currentUrl}`);
    if (currentUrl.endsWith('/dashboard')) {
      console.log('Login succeeded.');
      results.phases['Phase 2 - Authentication'].login = 'PASS';
      results.phases['Phase 2 - Authentication'].status = 'PASS';
    } else {
      console.log('Login failed.');
      results.phases['Phase 2 - Authentication'].login = 'FAIL';
      results.phases['Phase 2 - Authentication'].status = 'FAIL';
    }

    // PHASE 3 — CUSTOMER MODULE TESTING
    results.phases['Phase 3 - Customer Module'] = { status: 'IN_PROGRESS' };
    console.log('Navigating to Customer Module (Udhari Book)...');
    await page.goto(`${CLIENT_URL}/customers`, { waitUntil: 'networkidle2' });
    await delay(1500);

    // Create Customer
    console.log('Creating a new customer...');
    const addCustBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ADD CUSTOMER'));
    });
    if (addCustBtn) {
      await addCustBtn.asElement().click();
      await delay(500);
      
      // Type in modal
      const inputs = await page.$$('.modal-content input');
      if (inputs.length >= 3) {
        await inputs[0].type('Automation Customer');
        await inputs[1].type('9876543210');
        await inputs[2].type('456 QA Automation Lab Road');
      }
      
      const saveCustBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('.modal-content button')).find(b => b.textContent.includes('ADD CLIENT'));
      });
      await saveCustBtn.asElement().click();
      await delay(2000);
      console.log('Customer added.');
    } else {
      console.log('Could not find ADD CUSTOMER button.');
    }

    // Search Customer
    console.log('Searching for the added customer...');
    await page.type('input[placeholder*="SEARCH"]', 'Automation Customer');
    const searchBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SEARCH'));
    });
    await searchBtn.asElement().click();
    await delay(1000);

    const firstCustomerName = await page.evaluate(() => {
      const card = document.querySelector('.stat-card h3');
      return card ? card.textContent : null;
    });
    console.log(`First customer in search results: "${firstCustomerName}"`);
    if (firstCustomerName && firstCustomerName.includes('AUTOMATION CUSTOMER')) {
      results.phases['Phase 3 - Customer Module'].status = 'PASS';
    } else {
      results.phases['Phase 3 - Customer Module'].status = 'FAIL';
    }

    // PHASE 4 — PRODUCT MODULE TESTING
    results.phases['Phase 4 - Product Module'] = { status: 'IN_PROGRESS' };
    console.log('Navigating to Product Module...');
    await page.goto(`${CLIENT_URL}/products`, { waitUntil: 'networkidle2' });
    await delay(1500);

    // Add Product
    console.log('Adding new product...');
    const addProdBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ADD PRODUCT'));
    });
    await addProdBtn.asElement().click();
    await delay(500);

    const prodInputs = await page.$$('.modal-content input');
    const prodSelects = await page.$$('.modal-content select');
    
    // Fill product fields
    await prodInputs[0].type('QA Testing Soap'); // Name
    await prodInputs[1].type('SKU-QA-SOAP');     // SKU
    await prodSelects[0].select('snacks');        // Category (select value snacks)
    await prodInputs[2].type('10');              // Buy price
    await prodInputs[3].type('15');              // Sell price
    await prodInputs[4].type('80');              // Stock qty
    await prodSelects[1].select('pcs');           // Unit

    const saveProdBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('.modal-content button')).find(b => b.textContent.includes('SAVE PRODUCT'));
    });
    await saveProdBtn.asElement().click();
    await delay(2000);
    console.log('Product added.');

    // Search Product
    await page.type('input[placeholder*="SEARCH"]', 'QA Testing Soap');
    await delay(1000); // Debounce check
    
    const firstProductInTable = await page.evaluate(() => {
      const row = document.querySelector('tbody tr td');
      return row ? row.textContent : null;
    });
    console.log(`First product name in table: "${firstProductInTable}"`);
    if (firstProductInTable && firstProductInTable.includes('QA Testing Soap')) {
      results.phases['Phase 4 - Product Module'].status = 'PASS';
    } else {
      results.phases['Phase 4 - Product Module'].status = 'FAIL';
    }

    // PHASE 5 — BILLING MODULE & PHASE 6 — CUSTOMER LEDGER / UDHARI
    results.phases['Phase 5 - Billing Module'] = { status: 'IN_PROGRESS' };
    results.phases['Phase 6 - Customer Ledger / Udhari'] = { status: 'IN_PROGRESS' };

    console.log('Navigating to Billing Station...');
    await page.goto(`${CLIENT_URL}/billing`, { waitUntil: 'networkidle2' });
    await delay(1500);

    // Search and Add Item to Cart
    await page.type('input[placeholder*="Search products"]', 'QA Testing Soap');
    await delay(1000);
    const cartAddBtn = await page.evaluateHandle(() => {
      const dropdown = document.querySelector('div[style*="z-index"]');
      if (!dropdown) return null;
      return dropdown.querySelector('button');
    });
    
    if (cartAddBtn) {
      await cartAddBtn.asElement().click();
      await delay(500);
      console.log('Product added to cart.');
    } else {
      console.log('Could not find product in billing search dropdown.');
    }

    // Create Cash Bill
    await page.type('input[placeholder*="E.g. Ramesh"]', 'Cash Customer');
    
    // Payment method Cash
    const cashBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CASH'));
    });
    await cashBtn.asElement().click();
    
    const generateBillBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('GENERATE BILL'));
    });
    console.log('Generating Cash Bill...');
    await generateBillBtn.asElement().click();
    await delay(2000);

    const billSuccessHeading = await page.evaluate(() => {
      const h = document.querySelector('h2');
      return h ? h.textContent : null;
    });
    console.log(`Checkout status heading: "${billSuccessHeading}"`);
    if (billSuccessHeading && billSuccessHeading.includes('RECEIPT GENERATED')) {
      results.phases['Phase 5 - Billing Module'].cashBill = 'PASS';
      
      // Start a new bill
      const newBillBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('START NEW BILL'));
      });
      await newBillBtn.asElement().click();
      await delay(1000);
    } else {
      results.phases['Phase 5 - Billing Module'].cashBill = 'FAIL';
    }

    // Test: Udhari/Credit Bill Checkout (Phase 5 & 6)
    console.log('Adding product to cart again for Udhari bill test...');
    await page.type('input[placeholder*="Search products"]', 'QA Testing Soap');
    await delay(1000);
    const cartAddBtn2 = await page.evaluateHandle(() => {
      const dropdown = document.querySelector('div[style*="z-index"]');
      if (!dropdown) return null;
      return dropdown.querySelector('button');
    });
    await cartAddBtn2.asElement().click();
    await delay(500);

    await page.type('input[placeholder*="E.g. Ramesh"]', 'Automation Customer');
    
    const creditBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('CREDIT'));
    });
    await creditBtn.asElement().click();
    await delay(500);

    console.log('Generating Udhari Bill (clicking CREDIT + GENERATE BILL)...');
    const generateBillBtn2 = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('GENERATE BILL'));
    });
    await generateBillBtn2.asElement().click();
    await delay(2000);

    // Let's capture if there is an error in checkout
    let checkoutError = await page.evaluate(() => {
      const p = document.querySelector('p[style*="color-danger"]');
      return p ? p.innerText : null;
    });
    console.log(`Udhari Checkout Error logged in UI: "${checkoutError}"`);
    
    results.phases['Phase 5 - Billing Module'].creditBill = checkoutError ? 'FAIL' : 'PASS';
    if (checkoutError && checkoutError.includes('Invalid payment method')) {
      console.log('CONFIRMED BUG: Udhari checkout fails with "Invalid payment method" because frontend sends "credit" while backend validator requires "udhari".');
      results.phases['Phase 5 - Billing Module'].status = 'FAIL';
      results.phases['Phase 6 - Customer Ledger / Udhari'].status = 'FAIL';
    } else {
      results.phases['Phase 5 - Billing Module'].status = 'PASS';
      results.phases['Phase 6 - Customer Ledger / Udhari'].status = 'PASS';
    }

    // PHASE 7 — DASHBOARD
    results.phases['Phase 7 - Dashboard'] = { status: 'IN_PROGRESS' };
    console.log('Navigating to Dashboard Page...');
    await page.goto(`${CLIENT_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await delay(2000);
    
    const statsRendered = await page.evaluate(() => {
      const stats = document.querySelectorAll('.stat-card');
      return stats ? stats.length : 0;
    });
    console.log(`Number of stat cards rendered on Dashboard: ${statsRendered}`);
    if (statsRendered >= 4) {
      results.phases['Phase 7 - Dashboard'].status = 'PASS';
    } else {
      results.phases['Phase 7 - Dashboard'].status = 'FAIL';
    }

    // PHASE 8 — SECURITY TESTING
    results.phases['Phase 8 - Security Testing'] = { status: 'IN_PROGRESS' };
    // Fetch directly from server API without Authorization headers
    const rawApiTest = await page.evaluate(async (url) => {
      try {
        const response = await fetch(`${url}/products`);
        return { status: response.status };
      } catch (err) {
        return { error: err.message };
      }
    }, SERVER_URL);
    console.log(`Direct unauthenticated API request to /api/products response status: ${rawApiTest.status}`);
    if (rawApiTest.status === 401) {
      console.log('Security check: Request rejected with 401 Unauthorized correctly.');
      results.phases['Phase 8 - Security Testing'].status = 'PASS';
    } else {
      console.log('Security check: Unauthenticated access was NOT blocked with 401!');
      results.phases['Phase 8 - Security Testing'].status = 'FAIL';
    }

    // PHASE 9 — FRONTEND QA
    results.phases['Phase 9 - Frontend QA'] = {
      status: results.consoleErrors.length > 0 ? 'FAIL' : 'PASS',
      consoleErrorCount: results.consoleErrors.length,
      networkFailuresCount: results.networkFailures.length
    };

  } catch (err) {
    console.error('Test script runtime error:', err);
  } finally {
    await browser.close();
    console.log('=== E2E Validation Finished ===');
    console.log('Summary of Results:');
    console.log(JSON.stringify(results, null, 2));
    
    // Save output report to artifacts
    const reportPath = path.join(__dirname, 'server', 'test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`Saved detailed report to ${reportPath}`);
  }
}

runTests();
