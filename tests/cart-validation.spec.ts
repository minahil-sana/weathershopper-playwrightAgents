// spec: specs/weather-shopper-purchase-flow.testplan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { addAndEnsureCartCount, openCart } from './helpers';

function parsePrice(text: string): number {
  const match = text.match(/(\d+)/);
  if (!match) {
    throw new Error(`Could not parse price from: ${text}`);
  }
  return Number.parseInt(match[1], 10);
}

test.describe('Temperature-Driven Purchase Journeys', () => {
  test('Cart Validation and Data Integrity', async ({ page }) => {
    // 1. From listing page, add two valid items.
    await page.goto('http://weathershopper.pythonanywhere.com/');
    await page.getByRole('button', { name: 'Buy moisturizers' }).click();

    const addButtons = page.getByRole('button', { name: 'Add' });
    await addAndEnsureCartCount(page, addButtons.first(), 1);
    await addAndEnsureCartCount(page, addButtons.nth(1), 2);

    // 2. Open cart and verify line-item table structure.
    await openCart(page);
    await expect(page.getByRole('columnheader', { name: 'Item' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Price' })).toBeVisible();

    const initialRows = page.locator('tbody tr');
    const initialRowCount = await initialRows.count();
    expect(initialRowCount).toBe(2);

    const firstPrice = parsePrice(await initialRows.nth(0).locator('td').nth(1).innerText());
    const secondPrice = parsePrice(await initialRows.nth(1).locator('td').nth(1).innerText());
    const expectedInitialTotal = firstPrice + secondPrice;

    // 3. Compare computed total against displayed total.
    await expect(page.getByText(`Total: Rupees ${expectedInitialTotal}`)).toBeVisible();

    // 4. Navigate back, add one more item, then reopen cart and verify count + total update.
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Moisturizers' })).toBeVisible();
    await addAndEnsureCartCount(page, addButtons.nth(2), 3);

    await openCart(page);
    const updatedRows = page.locator('tbody tr');
    const updatedRowCount = await updatedRows.count();
    expect(updatedRowCount).toBeGreaterThan(0);

    let totalFromRows = 0;
    for (let i = 0; i < updatedRowCount; i += 1) {
      totalFromRows += parsePrice(await updatedRows.nth(i).locator('td').nth(1).innerText());
    }

    await expect(page.getByText(`Total: Rupees ${totalFromRows}`)).toBeVisible();
  });
});