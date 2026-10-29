import { test, expect, type Page } from '@playwright/test';

// "The nav" is read as the site's navigation bar: a <nav> element, or the page header that holds it.
function navButton(page: Page) {
  return page.locator('nav, header, [role="navigation"]').getByRole('button').first();
}

function hasDarkClass(page: Page) {
  return page.evaluate(() => document.body.classList.contains('dark'));
}

test('SPEC.md:10 a nav button toggles the dark class on <body>', async ({ page }) => {
  await page.goto('./');
  const button = navButton(page);
  await expect(button, 'no button found in the nav').toBeVisible();

  const before = await hasDarkClass(page);
  await button.click();
  expect(await hasDarkClass(page), 'first click should toggle "dark"').toBe(!before);
  await button.click();
  expect(await hasDarkClass(page), 'second click should toggle "dark" back').toBe(before);
});

// "Kept for the session" is read as: the choice survives a reload in the same tab.
test('SPEC.md:11 the dark-mode choice is kept after a reload', async ({ page }) => {
  await page.goto('./');
  const button = navButton(page);
  await expect(button, 'no button found in the nav').toBeVisible();

  await button.click();
  const chosen = await hasDarkClass(page);
  await page.reload();
  expect(await hasDarkClass(page), 'choice should survive a reload').toBe(chosen);
});
