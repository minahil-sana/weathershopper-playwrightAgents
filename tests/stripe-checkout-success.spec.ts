// spec: specs/weather-shopper-purchase-flow.testplan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { addAndEnsureCartCount, openCart } from './helpers';

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
      // Stripe test form can intermittently drop field formatting; retry once.
    }
  }

  await expect(page).toHaveURL(/\/confirmation$/);
}

test.describe('Temperature-Driven Purchase Journeys', () => {
  test('Stripe Checkout Happy Path', async ({ page }) => {
    // 1. Start with a non-empty cart and click Pay with Card.
    await page.goto('http://weathershopper.pythonanywhere.com/');
    await page.getByRole('button', { name: 'Buy sunscreens' }).click();

    const addButtons = page.getByRole('button', { name: 'Add' });
    await addAndEnsureCartCount(page, addButtons.first(), 1);
    await addAndEnsureCartCount(page, addButtons.nth(1), 2);

    await openCart(page);
    await expect(page.getByRole('button', { name: 'Pay with Card' })).toBeVisible();
    await page.getByRole('button', { name: 'Pay with Card' }).click();

    // 2. Enter valid Stripe test data and submit.
    await submitStripePayment(page);

    // 3. Verify redirect to confirmation with success content.
    await expect(page).toHaveURL(/\/confirmation$/);
    await expect(page.getByRole('heading', { name: 'PAYMENT SUCCESS' })).toBeVisible();
    await expect(page.getByText('Your payment was successful.')).toBeVisible();
  });
});