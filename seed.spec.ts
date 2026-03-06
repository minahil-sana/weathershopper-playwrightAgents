import { test, expect } from '@playwright/test';

test('seed', async ({ page }) => {
  await page.goto('http://weathershopper.pythonanywhere.com/');
  await expect(page).toHaveTitle(/Current Temperature/);
});