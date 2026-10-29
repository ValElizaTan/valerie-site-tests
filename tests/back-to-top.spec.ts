import { test, expect, type Locator, type Page } from '@playwright/test';

// The spec doesn't say how to identify the button, so we look for a button whose accessible name mentions "top".
// includeHidden: SPEC.md:15 requires the button to be hidden at the top, and getByRole skips hidden elements by default.
function backToTop(page: Page) {
  return page.getByRole('button', { name: /top/i, includeHidden: true });
}

// "Hidden" is read as not seen by the user: not rendered, transparent, or outside the viewport.
// Playwright's toBeVisible() counts opacity: 0 as visible, so this check is stricter.
function isShownToUser(button: Locator) {
  return button.evaluate((el) => {
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 &&
      r.top < window.innerHeight && r.left < window.innerWidth;
  });
}

async function scrollPastHero(page: Page) {
  await page.evaluate(() => {
    const hero = document.querySelector('#hero')!;
    window.scrollTo({ top: hero.getBoundingClientRect().bottom + window.scrollY + 1, behavior: 'instant' });
  });
}

test('SPEC.md:15 the back-to-top button is hidden at the top of the page', async ({ page }) => {
  await page.goto('./');
  // Make sure the button exists, otherwise "hidden" would pass trivially.
  await expect(backToTop(page), 'no back-to-top button found').toHaveCount(1);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(await isShownToUser(backToTop(page)), 'button should be hidden at the top').toBe(false);
});

test('SPEC.md:16 the back-to-top button is visible after scrolling past #hero', async ({ page }) => {
  await page.goto('./');
  await expect(backToTop(page), 'no back-to-top button found').toHaveCount(1);
  await scrollPastHero(page);
  await expect.poll(() => isShownToUser(backToTop(page)), { message: 'button should be visible past #hero' }).toBe(true);
});

test('SPEC.md:17 clicking the back-to-top button scrolls back to the top', async ({ page }) => {
  await page.goto('./');
  await expect(backToTop(page), 'no back-to-top button found').toHaveCount(1);
  await scrollPastHero(page);
  await expect.poll(() => isShownToUser(backToTop(page))).toBe(true);

  await backToTop(page).click();
  // Allows for smooth scrolling.
  await expect.poll(() => page.evaluate(() => window.scrollY), { message: 'page should be back at the top' }).toBe(0);
});
