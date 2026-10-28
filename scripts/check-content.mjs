import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const content = JSON.parse(
  await readFile(new URL('src/app/content/site-content.json', root), 'utf8'),
);
const manifest = JSON.parse(await readFile(new URL('public/assets/manifest.json', root), 'utf8'));
const imageSources = new Set();

function inspect(value) {
  if (!value || typeof value !== 'object') return;
  if ('src' in value) {
    assert(value.src.startsWith('/assets/images/'), `Image must be local: ${value.src}`);
    assert(value.alt && value.width > 0 && value.height > 0, `Incomplete image: ${value.src}`);
    imageSources.add(value.src);
  }
  for (const nested of Object.values(value)) inspect(nested);
}
inspect(content);

for (const records of [content.services, content.events]) {
  assert.equal(
    new Set(records.map((record) => record.slug)).size,
    records.length,
    'Duplicate slug',
  );
  assert(records.every((record) => /^[a-z0-9-]+$/.test(record.slug) && record.title));
}
assert.equal(
  new Set(content.reviews.map((review) => review.id)).size,
  content.reviews.length,
  'Duplicate review anchor',
);
for (const asset of manifest.assets) {
  const file = await stat(new URL(`public${asset.local}`, root));
  assert(file.size > 0, `Empty image: ${asset.local}`);
}
for (const src of imageSources)
  assert(
    manifest.assets.some((asset) => asset.local === src),
    `Missing provenance: ${src}`,
  );
assert.equal(content.services.length, 7);
assert.equal(content.events.length, 13);
assert.equal(content.faqs.length, 5);
assert.equal(content.venues.length, 4);
console.log(
  `Content verified: ${content.services.length} services, ${content.events.length} events, ${content.reviews.length} reviews, ${imageSources.size} local images.`,
);
