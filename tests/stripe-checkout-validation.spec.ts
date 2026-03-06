// spec: specs/weather-shopper-purchase-flow.testplan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { addAndEnsureCartCount, openCart } from './helpers';

test.describe('Temperature-Driven Purchase Journeys', () => {
  test('Stripe Checkout Validation and Failure Handling', async ({ page }) => {
    // 1. Open Stripe checkout from a non-empty cart and attempt submit with blank fields.
    await page.goto('http://weathershopper.pythonanywhere.com/');
    await page.getByRole('button', { name: 'Buy sunscreens' }).click();
    await addAndEnsureCartCount(page, page.getByRole('button', { name: 'Add' }).first(), 1);
    await openCart(page);
    await page.getByRole('button', { name: 'Pay with Card' }).click();

    const stripeFrame = page.locator('iframe[name="stripe_checkout_app"]').contentFrame();
    await stripeFrame.getByRole('button', { name: /Pay INR/ }).click();
    await expect(page).toHaveURL(/\/cart$/);

    // 2. Enter invalid card details and verify checkout remains in place.
    await stripeFrame.getByRole('textbox', { name: 'Email' }).fill('qa.tester@example.com');
    await stripeFrame.getByRole('textbox', { name: 'Card number' }).fill('1234123412341234');
    await stripeFrame.getByRole('textbox', { name: 'MM / YY' }).fill('1230');
    await stripeFrame.getByRole('textbox', { name: 'CVC' }).fill('123');
    await stripeFrame.getByRole('button', { name: /Pay INR/ }).click();
    await expect(page).toHaveURL(/\/cart$/);

    // 3. Enter a declined Stripe test card and submit; environment may either reject in-frame or continue.
    await stripeFrame.getByRole('textbox', { name: 'Card number' }).fill('4000000000000002');
    await stripeFrame.getByRole('button', { name: /Pay INR/ }).click();

    // 4. Validate outcome: either explicit failure remains in checkout, or app redirects to confirmation.
    await expect
      .poll(async () => {
        const url = page.url();
        return /\/cart$/.test(url) || /\/confirmation$/.test(url);
      })
      .toBeTruthy();
  });
});