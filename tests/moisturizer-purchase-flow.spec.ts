// spec: specs/weather-shopper-purchase-flow.testplan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import { addAndEnsureCartCount, openCart } from './helpers';

type PickedProduct = { name: string; price: number; index: number };

function parsePrice(text: string): number {
  const match = text.match(/(\d+)/);
  if (!match) {
    throw new Error(`Could not parse price from: ${text}`);
  }
  return Number.parseInt(match[1], 10);
}

test.describe('Temperature-Driven Purchase Journeys', () => {
  test('Moisturizer Purchase Flow with Product-Selection Rule', async ({ page }) => {
    // 1. Navigate to /moisturizer from the home page in a fresh state.
    await page.goto('http://weathershopper.pythonanywhere.com/');
    await page.getByRole('button', { name: 'Buy moisturizers' }).click();
    await expect(page).toHaveURL(/\/moisturizer$/);
    await expect(page.getByRole('heading', { name: 'Moisturizers' })).toBeVisible();

    // 2. Extract all moisturizer cards and split into Aloe and Almond groups.
    const addButtons = page.getByRole('button', { name: 'Add' });
    const cardCount = await addButtons.count();
    expect(cardCount).toBeGreaterThan(1);

    const aloeCandidates: PickedProduct[] = [];
    const almondCandidates: PickedProduct[] = [];

    for (let i = 0; i < cardCount; i += 1) {
      const card = addButtons.nth(i).locator('xpath=..');
      const name = (await card.locator('p').nth(0).innerText()).trim();
      const priceText = (await card.locator('p').nth(1).innerText()).trim();
      const price = parsePrice(priceText);

      if (/aloe/i.test(name)) {
        aloeCandidates.push({ name, price, index: i });
      }
      if (/almond/i.test(name)) {
        almondCandidates.push({ name, price, index: i });
      }
    }

    expect(aloeCandidates.length).toBeGreaterThan(0);
    expect(almondCandidates.length).toBeGreaterThan(0);

    // 3. Select and add the cheapest item from each required group.
    const cheapestAloe = aloeCandidates.reduce((min, item) => (item.price < min.price ? item : min));
    const cheapestAlmond = almondCandidates.reduce((min, item) => (item.price < min.price ? item : min));

    await addAndEnsureCartCount(page, addButtons.nth(cheapestAlmond.index), 1);
    await addAndEnsureCartCount(page, addButtons.nth(cheapestAloe.index), 2);

    // 4. Open cart and validate selected items and total.
    await openCart(page);
    await expect(page.getByText(cheapestAlmond.name)).toBeVisible();
    await expect(page.getByText(cheapestAloe.name)).toBeVisible();

    const expectedTotal = cheapestAlmond.price + cheapestAloe.price;
    await expect(page.getByText(`Total: Rupees ${expectedTotal}`)).toBeVisible();
  });
});