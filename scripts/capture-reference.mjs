import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { chromium } from '@playwright/test';

const execute = promisify(execFile);
const root = new URL('../reference/', import.meta.url);
await mkdir(new URL('pages/', root), { recursive: true });

async function capture(path) {
  const filename = path === '/' ? 'home' : path.split('/').filter(Boolean).join('--');
  const destination = new URL(`pages/${filename}.html`, root);
  let html;
  try {
    html = await readFile(destination, 'utf8');
  } catch {
    const response = await execute(
      'curl',
      [
        '--fail',
        '--location',
        '--retry',
        '2',
        '--max-time',
        '45',
        '--silent',
        '--show-error',
        `https://dipali.com${path}`,
      ],
      { maxBuffer: 12 * 1024 * 1024 },
    );
    html = response.stdout;
    await writeFile(destination, html);
  }
  const document = load(html);
  return { path, filename, document };
}

const home = await capture('/');
const gallery = await capture('/gallery/');
const services = await capture('/services/');
const paths = new Set([
  '/about/',
  '/reviews/',
  '/faqs/',
  '/venues/',
  '/contact/',
  '/opt-out-preferences/',
]);
for (const page of [home, gallery, services]) {
  page.document('a[href]').each((_, anchor) => {
    const url = new URL(page.document(anchor).attr('href'), 'https://dipali.com');
    if (/^\/(service|event)\//.test(url.pathname)) paths.add(url.pathname);
  });
}

const pages = [home, gallery, services];
const failures = [];
for (const path of paths) {
  try {
    const page = await capture(path);
    pages.push(page);
    console.log(`Captured ${path}`);
  } catch (error) {
    failures.push({ path, message: error.message });
    console.warn(`Unavailable ${path}`);
  }
}

const audit = pages.map(({ path, filename, document }) => ({
  path,
  filename,
  title: document('h1').first().text().trim(),
  description: document('meta[name="description"]').attr('content') ?? '',
  sections: document('main section')
    .map((_, section) => ({
      classes: document(section).attr('class') ?? '',
      headings: document(section)
        .find('h2,h3')
        .map((_, heading) => document(heading).text().trim())
        .get(),
      images: document(section).find('img').length,
      children: document(section)
        .children()
        .map((_, child) => `${child.tagName}.${document(child).attr('class') ?? ''}`)
        .get(),
    }))
    .get(),
}));
await writeFile(new URL('audit.json', root), JSON.stringify({ pages: audit, failures }, null, 2));

if (process.argv.includes('--screenshots')) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    for (const [label, width, height] of [
      ['desktop', 1440, 1000],
      ['mobile', 390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('https://dipali.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.hero img').evaluate((image) => image.decode());
      await page.screenshot({
        path: fileURLToPath(new URL(`home-${label}.png`, root)),
        fullPage: true,
      });
    }
  } finally {
    await browser.close();
  }
}
console.log(
  `Captured ${pages.length} pages; ${failures.length} unavailable. Audit: reference/audit.json`,
);
