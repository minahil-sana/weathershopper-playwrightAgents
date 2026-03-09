// spec: specs/weather-shopper-purchase-flow.testplan.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';

type SelectedProduct = {
  name: string;
  price: number;
  addIndex: number;
};

function parsePrice(text: string): number {
  const match = text.match(/(\d+)/);
  if (!match) {
    throw new Error(`Unable to parse price from: ${text}`);
  }
  return Number.parseInt(match[1], 10);
}

async function readProducts(page: Page): Promise<SelectedProduct[]> {
  const addButtons = page.getByRole('button', { name: 'Add' });
  const count = await addButtons.count();
  const products: SelectedProduct[] = [];

  for (let i = 0; i < count; i += 1) {
    const card = addButtons.nth(i).locator('xpath=..');
    const name = (await card.locator('p').nth(0).innerText()).trim();
    const priceText = (await card.locator('p').nth(1).innerText()).trim();
    products.push({ name, price: parsePrice(priceText), addIndex: i });
  }

  return products;
}

function cheapestByKeyword(products: SelectedProduct[], keywordRegex: RegExp): SelectedProduct {
  const candidates = products.filter((p) => keywordRegex.test(p.name));
  if (candidates.length === 0) {
    throw new Error(`No product found for keyword regex: ${keywordRegex}`);
  }
  return candidates.reduce((min, p) => (p.price < min.price ? p : min));
}

async function readCartCount(page: Page): Promise<number> {
  const text = await page.getByRole('button', { name: /^Cart -/ }).innerText();
  if (/empty/i.test(text)) {
    return 0;
  }
  const match = text.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

async function addAndWaitForCount(page: Page, addButton: ReturnType<Page['getByRole']>, expectedCount: number) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await addButton.click();
    try {
      await expect.poll(async () => readCartCount(page), { timeout: 3000 }).toBeGreaterThanOrEqual(expectedCount);
      return;
    } catch {
      // Retry because this live site occasionally misses an add click.
    }
  }
  await expect.poll(async () => readCartCount(page), { timeout: 5000 }).toBeGreaterThanOrEqual(expectedCount);
}

async function submitStripe(page: Page) {
  const stripeFrame = page.locator('iframe[name="stripe_checkout_app"]').contentFrame();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await stripeFrame.getByRole('textbox', { name: 'Email' }).fill('qa.tester@example.com');
    await stripeFrame.getByRole('textbox', { name: 'Card number' }).fill('4242424242424242');
    await stripeFrame.getByRole('textbox', { name: 'MM / YY' }).fill('1230');
    await stripeFrame.getByRole('textbox', { name: 'CVC' }).fill('123');
    await stripeFrame.getByRole('button', { name: /Pay INR/ }).click();

    try {
      await expect(page).toHaveURL(/\/confirmation$/, { timeout: 15000 });
      return;
    } catch {
      // Retry once if Stripe input formatting is flaky.
    }
  }
  await expect(page).toHaveURL(/\/confirmation$/);
}

test.describe('Single End-to-End Temperature Purchase Journey', () => {
  test('E2E Temperature-Based Product Selection to Successful Payment Confirmation', async ({ page }) => {
    // 1. Navigate to the Weather Shopper home page.
    await page.goto('http://weathershopper.pythonanywhere.com/');
    await expect(page).toHaveTitle(/Current Temperature/);
    await expect(page.getByRole('heading', { name: 'Current temperature' })).toBeVisible();

    // 2. Read and store the temperature value.
    const temperatureText = (await page.locator('#temperature').textContent()) ?? '';
    const storedTemperature = Number.parseInt(temperatureText.replace(/[^0-9-]/g, ''), 10);
    expect(Number.isNaN(storedTemperature)).toBeFalsy();

    // 3. Route by temperature and click category CTA.
    const shouldOpenMoisturizer = storedTemperature < 19 || (storedTemperature >= 19 && storedTemperature <= 34);
    if (shouldOpenMoisturizer) {
      await page.getByRole('button', { name: 'Buy moisturizers' }).click();
    } else {
      await page.getByRole('button', { name: 'Buy sunscreens' }).click();
    }

    // 4. Validate destination page correctness against stored temperature decision.
    if (storedTemperature < 19) {
      await expect(page.getByRole('heading', { name: 'Moisturizers' })).toBeVisible();
    } else if (storedTemperature > 34) {
      await expect(page.getByRole('heading', { name: 'Sunscreens' })).toBeVisible();
    } else {
      await expect(page.getByRole('heading', { name: 'Moisturizers' })).toBeVisible();
    }

    // 5. Verify cart state before adding products.
    await expect(page.getByRole('button', { name: 'Cart - Empty' })).toBeVisible();

    // 6. Collect product cards and group by branch keywords.
    const products = await readProducts(page);

    // 7. Select and add the two least expensive products by branch keyword rules.
    let selectedOne: SelectedProduct;
    let selectedTwo: SelectedProduct;
    if (storedTemperature < 19 || (storedTemperature >= 19 && storedTemperature <= 34)) {
      selectedOne = cheapestByKeyword(products, /aloe/i);
      selectedTwo = cheapestByKeyword(products, /almond/i);
    } else {
      selectedOne = cheapestByKeyword(products, /spf\s*-?\s*30/i);
      selectedTwo = cheapestByKeyword(products, /spf\s*-?\s*50/i);
    }

    const addButtons = page.getByRole('button', { name: 'Add' });
    await addAndWaitForCount(page, addButtons.nth(selectedOne.addIndex), 1);
    await addAndWaitForCount(page, addButtons.nth(selectedTwo.addIndex), 2);
    await expect.poll(async () => readCartCount(page)).toBeGreaterThanOrEqual(2);

    // 8. Click the cart button.
    await page.getByRole('button', { name: /^Cart -/ }).click();

    // 9. Validate cart line items against stored selected products.
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByText(selectedOne.name)).toBeVisible();
    await expect(page.getByText(selectedTwo.name)).toBeVisible();

    // 10. Validate cart total.
    const expectedTotal = selectedOne.price + selectedTwo.price;
    await expect(page.getByText(`Total: Rupees ${expectedTotal}`)).toBeVisible();

    // 11. Click Pay with Card to open Stripe checkout.
    await page.getByRole('button', { name: 'Pay with Card' }).click();

    // 12. Enter Stripe test checkout details and submit payment.
    await submitStripe(page);

    // 13. Verify post-payment navigation and confirmation content.
    await expect(page.getByText('PAYMENT SUCCESS')).toBeVisible();
    await expect(page.getByText('Your payment was successful.')).toBeVisible();
  });
});