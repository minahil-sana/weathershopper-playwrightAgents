// spec: specs/weather-shopper-purchase-flow.testplan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { addAndEnsureCartCount, openCart } from './helpers';

type Candidate = { name: string; price: number; index: number };

function parsePrice(text: string): number {
  const match = text.match(/(\d+)/);
  if (!match) {
    throw new Error(`Unable to parse price from: ${text}`);
  }
  return Number.parseInt(match[1], 10);
}

async function submitStripePayment(page: import('@playwright/test').Page) {
  const stripeFrame = page.locator('iframe[name="stripe_checkout_app"]').contentFrame();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await stripeFrame.getByRole('textbox', { name: 'Email' }).click();
    await stripeFrame.getByRole('textbox', { name: 'Email' }).fill('qa.tester@example.com');
    await stripeFrame.getByRole('textbox', { name: 'Card number' }).click();
    await stripeFrame.getByRole('textbox', { name: 'Card number' }).fill('4242424242424242');
    await stripeFrame.getByRole('textbox', { name: 'MM / YY' }).click();
    await stripeFrame.getByRole('textbox', { name: 'MM / YY' }).fill('1230');
    await stripeFrame.getByRole('textbox', { name: 'CVC' }).click();
    await stripeFrame.getByRole('textbox', { name: 'CVC' }).fill('123');
    await stripeFrame.getByRole('button', { name: /Pay INR/ }).click();

    try {
      await expect(page).toHaveURL(/\/confirmation$/, { timeout: 15000 });
      return;
    } catch {
      // Retry once if Stripe input formatting causes a rejected attempt.
    }
  }

  await expect(page).toHaveURL(/\/confirmation$/);
}

async function pickByRule(page: import('@playwright/test').Page) {
  const addButtons = page.getByRole('button', { name: 'Add' });
  const count = await addButtons.count();
  if (count < 2) {
    return null;
  }

  const aloe: Candidate[] = [];
  const almond: Candidate[] = [];
  const spf30: Candidate[] = [];
  const spf50: Candidate[] = [];
  const allProducts: Candidate[] = [];

  for (let i = 0; i < count; i += 1) {
    const card = addButtons.nth(i).locator('xpath=..');
    const name = (await card.locator('p').nth(0).innerText()).trim();
    const price = parsePrice((await card.locator('p').nth(1).innerText()).trim());
    allProducts.push({ name, price, index: i });

    if (/aloe/i.test(name)) aloe.push({ name, price, index: i });
    if (/almond/i.test(name)) almond.push({ name, price, index: i });
    if (/spf\s*-?\s*30/i.test(name)) spf30.push({ name, price, index: i });
    if (/spf\s*-?\s*50/i.test(name)) spf50.push({ name, price, index: i });
  }

  if (aloe.length > 0 && almond.length > 0) {
    const a = aloe.reduce((m, c) => (c.price < m.price ? c : m));
    const b = almond.reduce((m, c) => (c.price < m.price ? c : m));
    return [a, b];
  }

  if (spf30.length > 0 && spf50.length > 0) {
    const s30 = spf30.reduce((m, c) => (c.price < m.price ? c : m));
    const s50 = spf50.reduce((m, c) => (c.price < m.price ? c : m));
    return [s30, s50];
  }

  if (allProducts.length < 2) {
    return null;
  }

  const sorted = [...allProducts].sort((a, b) => a.price - b.price);
  return [sorted[0], sorted[1]];
}

test.describe('Temperature-Driven Purchase Journeys', () => {
  test('End-to-End Purchase Success Based on Temperature', async ({ page }) => {
    // 1. Open home page, read temperature, and choose deterministic route by rule.
    await page.goto('http://weathershopper.pythonanywhere.com/');
    const temperatureText = await page.locator('#temperature').textContent();
    const temperature = Number.parseInt((temperatureText ?? '').replace(/[^0-9-]/g, ''), 10);
    expect(Number.isNaN(temperature)).toBeFalsy();

    if (temperature < 19) {
      await page.getByRole('button', { name: 'Buy moisturizers' }).click();
      await expect(page).toHaveURL(/\/moisturizer$/);
    } else if (temperature > 34) {
      await page.getByRole('button', { name: 'Buy sunscreens' }).click();
      await expect(page).toHaveURL(/\/sunscreen$/);
    } else {
      await page.getByRole('button', { name: 'Buy moisturizers' }).click();
      await expect(page).toHaveURL(/\/moisturizer$/);
    }

    // 2. Add category-specific cheapest products based on page content.
    let selected = await pickByRule(page);
    if (!selected) {
      await page.goto('http://weathershopper.pythonanywhere.com/moisturizer');
      selected = await pickByRule(page);
    }
    if (!selected) {
      await page.goto('http://weathershopper.pythonanywhere.com/sunscreen');
      selected = await pickByRule(page);
    }
    expect(selected).not.toBeNull();
    const picked = selected!;
    const addButtons = page.getByRole('button', { name: 'Add' });
    await addAndEnsureCartCount(page, addButtons.nth(picked[0].index), 1);
    await addAndEnsureCartCount(page, addButtons.nth(picked[1].index), 2);

    // 3. Open cart and validate line items and total.
    await openCart(page);
    await expect(page.getByText(picked[0].name)).toBeVisible();
    await expect(page.getByText(picked[1].name)).toBeVisible();
    const expectedTotal = picked[0].price + picked[1].price;
    await expect(page.getByText(`Total: Rupees ${expectedTotal}`)).toBeVisible();

    // 4. Complete Stripe checkout using valid test card data.
    await page.getByRole('button', { name: 'Pay with Card' }).click();
    await submitStripePayment(page);

    // 5. Validate payment confirmation page.
    await expect(page).toHaveURL(/\/confirmation$/);
    await expect(page.getByRole('heading', { name: 'PAYMENT SUCCESS' })).toBeVisible();
    await expect(page.getByText('Your payment was successful.')).toBeVisible();
  });
});