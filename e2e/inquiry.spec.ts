import { expect, Page, test } from '@playwright/test';

async function completeInquiry(page: Page) {
  await page.getByLabel('First Name').fill('Test');
  await page.getByLabel('Last Name').fill('Couple');
  await page.getByLabel('Phone', { exact: false }).fill('9175550123');
  await page.getByLabel('Email', { exact: false }).fill('test@example.com');
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  await page.getByLabel('Event Date').fill(future.toISOString().slice(0, 10));
  await page.getByLabel('Event Type').selectOption('Wedding Ceremony');
  await page.getByLabel('Event Location').fill('Oheka Castle');
  await page.getByLabel('Event Budget').selectOption('25k - 50k');
  await page.getByLabel('Estimated Guest Count').fill('150');
  await page.getByLabel('Tell Us About Your Event').fill('Automated local test only.');
  await page.getByLabel('How Did You Hear About Us?').selectOption('Google Search');
  await page.getByRole('checkbox', { name: /By checking this box/ }).check();
}

test('validates required fields and focuses the first invalid input', async ({ page }) => {
  await page.goto('/contact/');
  await page.getByRole('button', { name: 'Submit Inquiry' }).click();
  await expect(page.locator('#first-name-error')).toHaveText('This field is required.');
  await expect(page.locator('#first-name')).toBeFocused();
  await expect(page.locator('#consent-error')).toContainText('confirm your consent');
});

test('does not claim delivery without an approved endpoint', async ({ page }) => {
  await page.goto('/contact/');
  await completeInquiry(page);
  await page.getByRole('button', { name: 'Submit Inquiry' }).click();
  await expect(page.getByRole('alert')).toContainText('temporarily unavailable');
  await expect(page.locator('#first-name')).toHaveValue('Test');
});

test('sends one inquiry, prevents duplicate submission and displays confirmed success', async ({
  page,
}) => {
  let submissions = 0;
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/site-config.json', (route) =>
    route.fulfill({ json: { inquiryEndpoint: '/api/inquiries' } }),
  );
  await page.route('**/api/inquiries', async (route) => {
    submissions++;
    expect(route.request().postDataJSON()).toMatchObject({
      firstName: 'Test',
      consent: true,
      guestCount: 150,
    });
    await gate;
    await route.fulfill({ json: { success: true, reference: 'local-test' } });
  });
  await page.goto('/contact/');
  await completeInquiry(page);
  await page.getByRole('button', { name: 'Submit Inquiry' }).click();
  await expect(page.getByRole('button', { name: 'Sending Inquiry' })).toBeDisabled();
  await expect.poll(() => submissions).toBe(1);
  await page.locator('form').evaluate((form) => (form as HTMLFormElement).requestSubmit());
  release?.();
  await expect(page.getByRole('status')).toContainText('Your inquiry has been received');
  expect(submissions).toBe(1);
  await expect(page.locator('#first-name')).toHaveValue('');
});

for (const status of [422, 429, 500]) {
  test(`preserves the form after an HTTP ${status} response`, async ({ page }) => {
    await page.route('**/site-config.json', (route) =>
      route.fulfill({ json: { inquiryEndpoint: '/api/inquiries' } }),
    );
    await page.route('**/api/inquiries', (route) =>
      route.fulfill({ status, json: { success: false } }),
    );
    await page.goto('/contact/');
    await completeInquiry(page);
    await page.getByRole('button', { name: 'Submit Inquiry' }).click();
    await expect(page.getByRole('alert')).toContainText(
      status === 429 ? 'Too many attempts' : 'could not be sent',
    );
    await expect(page.locator('#event-location')).toHaveValue('Oheka Castle');
    await expect(page.getByRole('button', { name: 'Submit Inquiry' })).toBeEnabled();
  });
}
