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
      // Stripe form can be flaky; retry once with a full refill.
    }
  }

  await expect(page).toHaveURL(/\/confirmation$/);
}

test.describe('Temperature-Driven Purchase Journeys', () => {
  test('Confirmation Page Validation', async ({ page }) => {
    // 1. Complete a successful payment through Stripe.
    await page.goto('http://weathershopper.pythonanywhere.com/');
    await page.getByRole('button', { name: 'Buy moisturizers' }).click();
    await addAndEnsureCartCount(page, page.getByRole('button', { name: 'Add' }).first(), 1);
    await openCart(page);
    await page.getByRole('button', { name: 'Pay with Card' }).click();
    await submitStripePayment(page);

    // 2. Validate key confirmation content.
    await expect(page.getByRole('heading', { name: 'PAYMENT SUCCESS' })).toBeVisible();
    await expect(page.getByText('Your payment was successful.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();

    // 3. Refresh confirmation page and verify success state persists.
    await page.reload();
    await expect(page).toHaveURL(/\/confirmation$/);
    await expect(page.getByRole('heading', { name: 'PAYMENT SUCCESS' })).toBeVisible();
  });
});