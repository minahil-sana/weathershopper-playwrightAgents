import { expect, type Locator, type Page } from '@playwright/test';

export async function getCartCount(page: Page): Promise<number> {
  const cartText = await page.getByRole('button', { name: /^Cart -/ }).innerText();
  if (/empty/i.test(cartText)) {
    return 0;
  }
  const match = cartText.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

export async function addAndEnsureCartCount(page: Page, addButton: Locator, expectedCount: number) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await addButton.click();
    try {
      await expect
        .poll(async () => getCartCount(page), { timeout: 2500 })
        .toBeGreaterThanOrEqual(expectedCount);
      return;
    } catch {
      // Retry because the site can intermittently miss click handlers under load.
    }
  }

  await expect
    .poll(async () => getCartCount(page), { timeout: 5000 })
    .toBeGreaterThanOrEqual(expectedCount);
}

export async function openCart(page: Page) {
  await page.getByRole('button', { name: /^Cart -/ }).click();
}
