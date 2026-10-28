import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import content from '../src/app/content/site-content.json' with { type: 'json' };
import seoSettings from '../src/app/seo/seo-settings.json' with { type: 'json' };
import { load } from 'cheerio';

const pages = [
  { path: '/', title: 'House of Dipali' },
  ...Object.entries(content.pages)
    .filter(([path, heading]) => path !== '/' && heading.title)
    .map(([path, heading]) => ({ path, title: heading.title })),
  ...content.services.map((service) => ({
    path: `/service/${service.slug}/`,
    title: service.title,
  })),
  ...content.events.map((event) => ({ path: `/event/${event.slug}/`, title: event.title })),
  { path: '/opt-out-preferences/', title: 'Opt-out preferences' },
];

for (const record of pages) {
  test(`renders ${record.path} without overflow or runtime errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const response = await page.goto(record.path);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('main h1')).toHaveText(record.title);
    await expect(page.locator('footer')).toContainText('House of Dipali');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('homepage photographs and service carousel work', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.locator('.hero > img')).toBeVisible();
  await expect
    .poll(() =>
      page.locator('.hero > img').evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Next services' }).click();
  await expect
    .poll(() => page.locator('.service-track').evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Previous services' }).click();
  await expect
    .poll(() => page.locator('.service-track').evaluate((element) => element.scrollLeft))
    .toBe(0);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('header')).not.toHaveClass(/solid/);
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
});

test('mobile menu traps focus, closes with Escape and navigates', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile navigation only');
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open menu' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Navigation' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole('link', { name: 'Services', exact: true }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(dialog).not.toBeVisible();
});

test('gallery supports keyboard navigation and focus restoration', async ({ page }) => {
  await page.goto('/service/stage-design/');
  const firstPhoto = page.locator('.photo-grid a').first();
  await firstPhoto.click();
  await expect(page.locator('.pswp')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.pswp__counter')).toHaveText(/2\s*\/\s*34/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.pswp')).toHaveCount(0);
  await expect(firstPhoto).toBeFocused();
});

test('FAQ questions expand and collapse', async ({ page }) => {
  await page.goto('/faqs/');
  const question = page.locator('details').first();
  await question.locator('summary').click();
  await expect(question).toHaveAttribute('open', '');
  await expect(question.locator('.answer')).toBeVisible();
  await question.locator('summary').click();
  await expect(question).not.toHaveAttribute('open');
});

test('review links preserve original anchors', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Read the full review' }).first().click();
  await expect(page).toHaveURL(/\/reviews#review-9424$/);
  await expect(page.locator('#review-9424')).toBeInViewport();
});

test('privacy preferences persist on this browser', async ({ page }) => {
  await page.goto('/opt-out-preferences/');
  await page.getByRole('checkbox', { name: 'Statistics', exact: true }).check();
  await page.getByRole('button', { name: 'Save Preferences' }).click();
  await expect(page.getByRole('status')).toContainText('have been saved');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Statistics', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Marketing', exact: true })).not.toBeChecked();
});

test('unknown content does not render an empty detail page', async ({ page }) => {
  await page.goto('/service/not-a-service/');
  await expect(page.locator('main h1')).toHaveText('Page not found.');
});

for (const route of ['/', '/contact/', '/faqs/']) {
  test(`has no serious accessibility violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      ),
    ).toEqual([]);
  });
}

test('prerendered HTML includes route-specific metadata without JavaScript', async ({
  request,
}) => {
  const response = await request.get('/service/stage-design/');
  const document = load(await response.text());
  expect(document('title').text()).toBe('Stage Design | House of Dipali');
  expect(document('h1').text()).toBe('Stage Design');
  expect(document('meta[name="robots"]').attr('content')).toBe('noindex, nofollow');
  expect(document('link[rel="canonical"]').attr('href')).toBe(
    `${seoSettings.origin}/service/stage-design/`,
  );
  expect(document('meta[name="description"]').attr('content')).toContain('stage');
});

test('static hosting returns real 404 statuses for missing routes and files', async ({
  request,
}) => {
  test.skip(process.env['PLAYWRIGHT_STATIC'] !== 'true', 'Production-style static preview only');
  expect((await request.get('/this-page-does-not-exist/')).status()).toBe(404);
  expect((await request.get('/service/this-service-does-not-exist/')).status()).toBe(404);
  expect((await request.get('/assets/missing.webp')).status()).toBe(404);
  expect((await request.get('/event/abhi-sravya-wedding-celebration/')).status()).toBe(200);
});

test('home fits additional tablet and small-phone viewports', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Additional viewport matrix runs once');
  for (const width of [360, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#home-title')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const heading = await page.locator('#home-title').boundingBox();
    const header = await page.locator('header').boundingBox();
    expect(heading!.y).toBeGreaterThan(header!.y + header!.height);
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`) });
  }
});
