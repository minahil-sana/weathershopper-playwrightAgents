// spec: specs/weather-shopper-purchase-flow.testplan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Temperature-Driven Purchase Journeys', () => {
  test('Temperature-Based Product Path Selection on Home Page', async ({ page }) => {
    // 1. Open the Weather Shopper home page.
    await page.goto('http://weathershopper.pythonanywhere.com/');
    await expect(page).toHaveTitle(/Current Temperature/);
    await expect(page.getByRole('heading', { name: 'Current temperature' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buy moisturizers' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buy sunscreens' })).toBeVisible();

    // 2. Read and store the displayed temperature value as an integer.
    const temperatureText = await page.locator('#temperature').textContent();
    const temperatureValue = Number.parseInt((temperatureText ?? '').replace(/[^0-9-]/g, ''), 10);
    expect(Number.isNaN(temperatureValue)).toBeFalsy();

    // 3. Apply routing rule check: if temperature is below 19, click Buy moisturizers; if above 34, click Buy sunscreens; otherwise use deterministic fallback.
    const choseMoisturizerPath = temperatureValue < 19 || (temperatureValue >= 19 && temperatureValue <= 34);
    if (choseMoisturizerPath) {
      await page.getByRole('button', { name: 'Buy moisturizers' }).click();
    } else {
      await page.getByRole('button', { name: 'Buy sunscreens' }).click();
    }

    // 4. Verify destination page heading and cart initially empty.
    if (choseMoisturizerPath) {
      await expect(page).toHaveURL(/\/moisturizer$/);
      await expect(page.getByRole('heading', { name: 'Moisturizers' })).toBeVisible();
    } else {
      await expect(page).toHaveURL(/\/sunscreen$/);
      await expect(page.getByRole('heading', { name: 'Sunscreens' })).toBeVisible();
    }
    await expect(page.getByRole('button', { name: 'Cart - Empty' })).toBeVisible();
  });
});