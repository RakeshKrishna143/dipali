import assert from 'node:assert/strict';
import { copyFile, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const content = JSON.parse(
  await readFile(new URL('src/app/content/site-content.json', root), 'utf8'),
);
const siteUrl = new URL(process.env.SITE_ORIGIN ?? 'http://127.0.0.1:4200');
const origin = siteUrl.origin;
const basePath = siteUrl.pathname.replace(/\/?$/, '/');
const deploymentUrl = new URL(basePath, origin);
const indexable = process.env.SITE_INDEXABLE === 'true';
assert(
  !indexable || origin.startsWith('https://'),
  'Indexable production builds require an HTTPS SITE_ORIGIN.',
);
const routes = [
  ...new Set([
    ...Object.keys(content.pages),
    ...content.services.map((service) => `/service/${service.slug}/`),
    ...content.events.map((event) => `/event/${event.slug}/`),
  ]),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((path) => `  <url><loc>${new URL(path.slice(1), deploymentUrl).href}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(new URL('public/sitemap.xml', root), sitemap);
await writeFile(
  new URL('public/robots.txt', root),
  indexable
    ? `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', deploymentUrl).href}\n`
    : 'User-agent: *\nDisallow: /\n',
);
await writeFile(
  new URL('src/app/seo/seo-settings.json', root),
  `${JSON.stringify({ origin, basePath, indexable }, null, 2)}\n`,
);
await copyFile(new URL(`public${content.mark.src}`, root), new URL('public/favicon.webp', root));
console.log(
  `Prepared ${routes.length} sitemap URLs. Search indexing: ${indexable ? 'enabled' : 'disabled'}.`,
);
