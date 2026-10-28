import { expect, test } from '@playwright/test';
import seoSettings from '../src/app/seo/seo-settings.json' with { type: 'json' };

test('local images, configuration and lightbox respect the deployment base path', async ({
  page,
  baseURL,
}, testInfo) => {
  const applicationUrl = new URL(baseURL!);
  const failedRequests: string[] = [];
  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') failedRequests.push(message.text());
  });

  await page.goto(applicationUrl.href);
  expect(new URL(await page.evaluate(() => document.baseURI)).pathname).toBe(
    applicationUrl.pathname,
  );
  for (const selector of ['header img', '.hero > img']) {
    const image = page.locator(selector).first();
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    expect(
      await image.evaluate((element) => new URL((element as HTMLImageElement).currentSrc).pathname),
    ).toMatch(new RegExp(`^${applicationUrl.pathname}assets/images/`));
  }
  await page.screenshot({ path: testInfo.outputPath('deployment-home.png') });

  const configuration = await page.evaluate(async () => {
    const response = await fetch('site-config.json');
    return { status: response.status, url: response.url };
  });
  expect(configuration.status).toBe(200);
  expect(new URL(configuration.url).pathname).toBe(`${applicationUrl.pathname}site-config.json`);

  await page.goto(new URL('service/stage-design/', applicationUrl).href);
  await expect(page.locator('main h1')).toHaveText('Stage Design');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    new URL('service/stage-design/', new URL(seoSettings.basePath, seoSettings.origin)).href,
  );
  const firstPhoto = page.locator('.photo-grid a').first();
  await expect
    .poll(() =>
      firstPhoto.locator('img').evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await firstPhoto.click();
  await expect(page.locator('.pswp')).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator('.pswp__img:visible')
        .first()
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('.pswp')).toHaveCount(0);
  expect(failedRequests).toEqual([]);
});
