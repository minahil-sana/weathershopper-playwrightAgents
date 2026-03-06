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
  test('Sunscreen Purchase Flow with SPF Selection Rule', async ({ page }) => {
    // 1. Navigate to /sunscreen from the home page in a fresh state.
    await page.goto('http://weathershopper.pythonanywhere.com/');
    await page.getByRole('button', { name: 'Buy sunscreens' }).click();
    await expect(page).toHaveURL(/\/sunscreen$/);
    await expect(page.getByRole('heading', { name: 'Sunscreens' })).toBeVisible();

    // 2. Split products by SPF-30 and SPF-50 groups.
    const addButtons = page.getByRole('button', { name: 'Add' });
    const cardCount = await addButtons.count();
    expect(cardCount).toBeGreaterThan(1);

    const spf30Candidates: PickedProduct[] = [];
    const spf50Candidates: PickedProduct[] = [];

    for (let i = 0; i < cardCount; i += 1) {
      const card = addButtons.nth(i).locator('xpath=..');
      const name = (await card.locator('p').nth(0).innerText()).trim();
      const priceText = (await card.locator('p').nth(1).innerText()).trim();
      const price = parsePrice(priceText);

      if (/spf\s*-?\s*30/i.test(name)) {
        spf30Candidates.push({ name, price, index: i });
      }
      if (/spf\s*-?\s*50/i.test(name)) {
        spf50Candidates.push({ name, price, index: i });
      }
    }

    expect(spf30Candidates.length).toBeGreaterThan(0);
    expect(spf50Candidates.length).toBeGreaterThan(0);

    // 3. Add the lowest-priced SPF-30 and SPF-50 products.
    const cheapestSpf30 = spf30Candidates.reduce((min, item) => (item.price < min.price ? item : min));
    const cheapestSpf50 = spf50Candidates.reduce((min, item) => (item.price < min.price ? item : min));

    await addAndEnsureCartCount(page, addButtons.nth(cheapestSpf30.index), 1);
    await addAndEnsureCartCount(page, addButtons.nth(cheapestSpf50.index), 2);

    // 4. Open cart and verify selected products and total.
    await openCart(page);
    await expect(page.getByText(cheapestSpf30.name)).toBeVisible();
    await expect(page.getByText(cheapestSpf50.name)).toBeVisible();

    const expectedTotal = cheapestSpf30.price + cheapestSpf50.price;
    await expect(page.getByText(`Total: Rupees ${expectedTotal}`)).toBeVisible();
  });
});