import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { load } from 'cheerio';

const execute = promisify(execFile);
const root = new URL('../', import.meta.url);
const assets = new Map();
const clean = (value) => value.replace(/\s+/g, ' ').trim();
const audit = JSON.parse(await readFile(new URL('reference/audit.json', root), 'utf8'));

async function page(name) {
  return load(await readFile(new URL(`reference/pages/${name}.html`, root), 'utf8'));
}

function register(url) {
  assert(url?.startsWith('https://dipali.com/'), `Unexpected asset origin: ${url}`);
  if (!assets.has(url)) {
    const hash = createHash('sha256').update(url).digest('hex').slice(0, 10);
    const filename = `${hash}-${basename(new URL(url).pathname).replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    assets.set(url, `/assets/images/${filename}`);
  }
  return assets.get(url);
}

function image(document, element, fallbackAlt = '') {
  const picture = document(element).closest('picture');
  const source = picture.find('source[type="image/webp"]').attr('srcset');
  const url = source?.split(',')[0].trim().split(/\s+/)[0] ?? document(element).attr('src');
  return {
    src: register(url),
    alt: document(element).attr('alt') || fallbackAlt,
    width: Number(document(element).attr('width')) || 1200,
    height: Number(document(element).attr('height')) || 800,
  };
}

function images(document, selector, alt) {
  return document(selector)
    .map((_, element) => image(document, element, alt))
    .get();
}

function paragraphs(document, selector) {
  return document(selector)
    .map((_, element) => clean(document(element).text()))
    .get()
    .filter(Boolean);
}

function heading(document, selector) {
  const element = document(selector).first();
  return {
    title: clean(element.find('h1,h2').first().text()),
    description: clean(element.find('p').first().text()),
    eyebrow: clean(element.find('.eyebrow').first().text()),
  };
}

const home = await page('home');
const listing = await page('services');
const gallery = await page('gallery');
const about = await page('about');
const faq = await page('faqs');
const venues = await page('venues');
const reviews = await page('reviews');
const contact = await page('contact');
const legal = await page('opt-out-preferences');

const serviceRecords = [];
for (const route of audit.pages.filter((record) => record.path.startsWith('/service/'))) {
  const detail = await page(route.filename);
  const title = route.title;
  const card = listing(`a[href="https://dipali.com${route.path}"]`).first();
  const photo = card.find('img').first();
  const background = card
    .find('[style*="background-image"]')
    .attr('style')
    ?.match(/url\(["']?([^)'"\s]+)/)?.[1];
  const photos = images(detail, '.service-showcase-section img', title);
  const cover = photo.length
    ? image(listing, photo[0], title)
    : background
      ? { src: register(background), alt: title, width: 768, height: 1152 }
      : photos[0];
  const copy = paragraphs(detail, '.service-copy p');
  serviceRecords.push({
    slug: route.path.split('/')[2],
    title,
    image: cover,
    summary:
      clean(home(`a[href="https://dipali.com${route.path}"]`).find('p').first().text()) || copy[0],
    paragraphs: copy,
    images: photos,
    closing: {
      title: clean(detail('.service-closing h2').text()),
      paragraphs: paragraphs(detail, '.service-closing p, .service-showcase-teaser p'),
    },
  });
}

const eventRecords = [];
for (const route of audit.pages.filter((record) => record.path.startsWith('/event/'))) {
  const detail = await page(route.filename);
  const cover = gallery(`a[href="https://dipali.com${route.path}"] img`).first();
  eventRecords.push({
    slug: route.path.split('/')[2],
    title: route.title,
    image: image(gallery, cover[0], route.title),
    venue: clean(detail('.event-meta-item .value').text()),
    paragraphs: paragraphs(detail, '.event-story p'),
    galleries: detail('.event-segment')
      .map((_, section) => ({
        title: clean(detail(section).find('h2').first().text()),
        images: detail(section)
          .find('img')
          .map((_, element) => image(detail, element, route.title))
          .get(),
      }))
      .get(),
  });
}

const reviewRecords = reviews('.review-card')
  .map((_, element) => {
    const meta = reviews(element)
      .find('.review-meta > span')
      .filter(
        (_, span) =>
          !reviews(span).hasClass('review-sep') && !reviews(span).hasClass('review-source'),
      );
    return {
      id: reviews(element).attr('id'),
      quote: clean(reviews(element).find('.review-quote').text()),
      name: clean(reviews(element).find('.review-name').text()),
      occasion: clean(meta.eq(1).text()),
      date: clean(meta.eq(2).text()),
    };
  })
  .get();

const legalSections = [];
legal('main script, main style, main form').remove();
legal('main h2, main h3, main p').each((_, element) => {
  const text = clean(legal(element).text());
  if (!text) return;
  if (/^h[23]$/.test(element.tagName)) legalSections.push({ title: text, paragraphs: [] });
  else {
    if (!legalSections.length) legalSections.push({ title: '', paragraphs: [] });
    legalSections.at(-1).paragraphs.push(text);
  }
});

const content = {
  home: {
    hero: image(home, home('.hero img')[0], 'House of Dipali wedding floral design'),
    intro: heading(home, '.intro-about'),
    services: heading(home, '.section-dark .section-head'),
    events: heading(home, '.home-stories-preview').title
      ? heading(home, '.home-stories-preview')
      : heading(home, 'section:has(.home-stories-preview) .section-head'),
  },
  logo: image(home, home('.brand-logo-full')[0], 'House of Dipali'),
  mark: image(home, home('.brand-logo-mark')[0], 'House of Dipali'),
  pages: {},
  services: serviceRecords,
  events: eventRecords,
  reviews: reviewRecords,
  about: about('.about-story-row')
    .map((_, element) => ({
      title: clean(about(element).find('h2,h3').first().text()),
      paragraphs: about(element)
        .find('.about-story-copy p')
        .map((_, para) => clean(about(para).text()))
        .get(),
      image: image(
        about,
        about(element).find('img')[0],
        clean(about(element).find('h2,h3').text()),
      ),
    }))
    .get(),
  values: about('.section-dark .card')
    .map((_, element) => ({
      title: clean(about(element).find('h3').text()),
      description: clean(about(element).find('p').text()),
    }))
    .get(),
  faqs: faq('.faq-item')
    .map((_, element) => ({
      question: clean(faq(element).find('.faq-q').clone().find('.icon').remove().end().text()),
      answer: faq(element)
        .find('.faq-a p')
        .map((_, para) => clean(faq(para).text()))
        .get(),
    }))
    .get(),
  venues: venues('.venues-col')
    .map((_, element) => ({
      region: clean(venues(element).find('h2,h3').first().text()),
      venues: venues(element)
        .find('li')
        .map((_, item) => ({
          name: clean(
            venues(item)
              .find('.venues-name')
              .clone()
              .find('.sr-only, .venues-star')
              .remove()
              .end()
              .text(),
          ),
          city: clean(venues(item).find('.venues-city').text()),
          preferred: venues(item).hasClass('is-preferred'),
        }))
        .get(),
    }))
    .get(),
  legal: legalSections,
  formOptions: Object.fromEntries(
    [
      ['eventType', '#f-type'],
      ['budget', '#f-budget'],
      ['referralSource', '#f-heard'],
    ].map(([key, selector]) => [
      key,
      contact(`${selector} option`)
        .map((_, option) => contact(option).val())
        .get()
        .filter(Boolean),
    ]),
  ),
};

for (const route of audit.pages.filter((record) => !/^\/(service|event)\//.test(record.path))) {
  const document = await page(route.filename);
  content.pages[route.path] = heading(document, '.page-hero');
}

assert.equal(content.services.length, 7);
assert.equal(content.events.length, 13);
assert.equal(content.faqs.length, 5);
assert(content.reviews.length > 10);
assert(content.about.every((section) => section.title && section.paragraphs.length));
assert(content.venues.every((group) => group.venues.length));
for (const record of [...content.services, ...content.events])
  assert(record.image?.src && record.title && record.slug);

await mkdir(new URL('public/assets/images/', root), { recursive: true });
const queue = [...assets];
let downloaded = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const [url, destination] = queue.shift();
      const localPath = fileURLToPath(new URL(`public${destination}`, root));
      try {
        await access(localPath);
      } catch {
        await execute('curl', [
          '--fail',
          '--location',
          '--retry',
          '2',
          '--max-time',
          '60',
          '--silent',
          '--show-error',
          '--output',
          localPath,
          url,
        ]);
      }
      downloaded++;
      if (downloaded % 50 === 0) console.log(`Verified ${downloaded}/${assets.size} local images`);
    }
  }),
);

const { legal: legalContent, ...sharedContent } = content;
await writeFile(
  new URL('src/app/content/site-content.json', root),
  JSON.stringify(sharedContent, null, 2),
);
await writeFile(
  new URL('src/app/legal/legal-content.json', root),
  JSON.stringify(legalContent, null, 2),
);
await writeFile(
  new URL('public/assets/manifest.json', root),
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      source: 'https://dipali.com',
      assets: [...assets].map(([source, local]) => ({ source, local })),
      licensedFont:
        'Jedira is not redistributed. Supply licensed webfont files before final visual approval.',
    },
    null,
    2,
  ),
);
console.log(
  `Imported ${content.services.length} services, ${content.events.length} events, ${content.reviews.length} reviews and ${assets.size} local images.`,
);
