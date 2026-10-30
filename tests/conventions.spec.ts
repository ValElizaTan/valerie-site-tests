import { test, expect, type Page } from '@playwright/test';

// Requests to the GitHub repos API, whichever user or query string the site uses.
const REPOS_API = /api\.github\.com\/users\/[^/]+\/repos/;

// Text in #repos once the heading is removed, so we can tell whether a message is shown.
async function reposBodyText(page: Page): Promise<string> {
  return page.locator('#repos').evaluate((el) => {
    const copy = el.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => h.remove());
    return (copy.textContent ?? '').trim();
  });
}

test('SPEC.md:4 all six section ids exist', async ({ page }) => {
  await page.goto('./');
  for (const id of ['hero', 'about', 'skills', 'projects', 'repos', 'contact']) {
    await expect(page.locator(`#${id}`), `#${id} should exist`).toHaveCount(1);
  }
});

test('SPEC.md:5 no horizontal scroll at 375px wide', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('./');
  // Wait for late content (such as the repo list) so it is included in the measurement.
  await page.waitForLoadState('networkidle');
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, 'page is wider than the viewport').toBeLessThanOrEqual(clientWidth);
});

test.describe('SPEC.md:6 #repos shows repo cards, or a plain message when there are none or the fetch fails', () => {
  test('lists the repos GitHub returns', async ({ page }) => {
    const response = page.waitForResponse(REPOS_API);
    await page.goto('./');
    const res = await response;
    // The profile README repo is the one named after the user in the request URL (GitHub ignores case).
    const user = new URL(res.url()).pathname.split('/')[2].toLowerCase();
    const all = res.ok() ? ((await res.json()) as Array<{ name: string }>) : [];
    const repos = all.filter(({ name }) => name.toLowerCase() !== user);
    test.skip(repos.length === 0, 'GitHub returned no repos to list; the empty and failure cases are covered below');

    const section = page.locator('#repos');
    for (const { name } of repos) {
      await expect(section, `repo "${name}" should be listed`).toContainText(name);
    }
    // Other repo names can contain the user's name (e.g. <user>.github.io), so look for a card title that is exactly it.
    const profileTitle = section
      .locator('h1, h2, h3, h4, h5, h6, a')
      .filter({ hasText: new RegExp(`^\\s*${user.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i') });
    await expect(profileTitle, 'the profile README repo should not be listed').toHaveCount(0);
  });

  test('shows a message when there are no repos', async ({ page }) => {
    await page.route(REPOS_API, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    const response = page.waitForResponse(REPOS_API);
    await page.goto('./');
    await response;
    await page.waitForLoadState('networkidle');
    expect(await reposBodyText(page), '#repos should show a message').not.toBe('');
  });

  test('shows a message when the fetch fails', async ({ page }) => {
    await page.route(REPOS_API, (route) => route.fulfill({ status: 500, body: 'Server error' }));
    const response = page.waitForResponse(REPOS_API);
    await page.goto('./');
    await response;
    await page.waitForLoadState('networkidle');
    expect(await reposBodyText(page), '#repos should show a message').not.toBe('');
  });
});

test('SPEC.md:7 #hero and #contact link to email, GitHub and LinkedIn', async ({ page }) => {
  await page.goto('./');
  for (const id of ['hero', 'contact']) {
    const section = page.locator(`#${id}`);
    await expect(section.locator('a[href^="mailto:"]'), `#${id} email link`).not.toHaveCount(0);
    await expect(section.locator('a[href*="github.com"]'), `#${id} GitHub link`).not.toHaveCount(0);
    await expect(section.locator('a[href*="linkedin.com"]'), `#${id} LinkedIn link`).not.toHaveCount(0);
  }
});
