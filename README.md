# House of Dipali

Angular 22 recreation of the public House of Dipali website. Standalone components, strict TypeScript/templates, OnPush change detection, signals, typed reactive forms, lazy feature routes, and static prerendering.

## Run

Use a supported Node version (verified with Node 22.23.1) and Bash:

```bash
npm ci
npm start -- --host 127.0.0.1 --port 4200
```

Development: http://127.0.0.1:4200/. Production-style static preview:

```bash
npm run build
npm run preview
```

Preview: http://127.0.0.1:4201/. Change `PORT` if needed. This local verification server serves prerendered deep links and returns real HTTP 404 responses; it is not a production hosting service.

## Architecture

- `src/app/content`: typed canonical records and slug lookups. Seven services, thirteen event stories, twenty reviews, five FAQs and four venue groups are imported from the reference.
- `src/app/shell`: shared header/mobile dialog, navigation and footer.
- Feature directories own their pages/cards. One template renders every service; another renders every event. Resolvers reject missing records.
- `src/app/shared`: repeated headings, consultation CTA, testimonials, accessible field labels/errors and one lazy PhotoSwipe gallery implementation.
- `src/styles`: reference-derived design tokens; styles are scoped to their owning components.
- `src/app/seo`: centralized per-route title, description, canonical and social metadata. Preview indexing is disabled by default.
- `public/assets`: 458 local photographs/logos plus a provenance manifest. No production image hotlinks, live Google review API, tracking scripts or external font requests are used.
- Legal text and the gallery viewer load only with their respective features.

## Inquiry Endpoint

Online delivery is intentionally unconfigured. The form validates real fields but never pretends that an inquiry was delivered. Set `inquiryEndpoint` in `public/site-config.json` to an approved HTTPS URL or same-origin path such as `/api/inquiries`, then rebuild or deploy the updated configuration.

The endpoint must accept a JSON `POST` with:

```json
{
  "firstName": "Test",
  "lastName": "Couple",
  "phone": "9175550123",
  "email": "test@example.com",
  "eventDate": "2027-08-20",
  "eventType": "Wedding Ceremony",
  "eventLocation": "Oheka Castle",
  "eventBudget": "25k - 50k",
  "guestCount": 150,
  "message": "Event details",
  "referralSource": "Google Search",
  "consent": true,
  "website": ""
}
```

Return `{ "success": true, "reference": "optional-id" }` only after accepting the inquiry. Other responses are treated as unconfirmed/failed. Validation failures should use 422, throttling 429, and delivery/server failures 5xx. There are no automatic POST retries. Input is preserved on failure and duplicate in-flight submissions are prevented.

Server-side validation, origin restrictions, rate limiting, honeypot enforcement, safe delivery, redacted logs, approved retention and consent evidence are endpoint responsibilities. Do not put credentials in the Angular app. The source form's 14-day lead time, ten-digit phone constraint, limits and dropdown options are implemented; owner approval is required before launch. Browser tests mock delivery and never submit to production.

## Verification

```bash
npm run content:check
npm run lint
npm test -- --watch=false
npx playwright install chromium
npm run test:e2e
npm run build
npm audit
```

The Playwright suite covers all public routes at desktop/mobile sizes, mobile menu/Escape/focus behavior, gallery keyboard controls, FAQ disclosure, review anchors, privacy persistence, required-field focus, pending/success/error/rate-limit submission states, duplicate submission prevention, image rendering, overflow and serious accessibility violations. Homepage captures are under `test-results`; these are verification artifacts, not proof of pixel-perfect reference parity.

Test a running production-style preview using:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4201 PLAYWRIGHT_STATIC=true npm run test:e2e
```

The Vite override is narrowly scoped to `@angular/build` to avoid its vulnerable 8.3.0 development dependency. Keep it until the builder ships a patched dependency; rerun the audit and build before removing it.

## Content Refresh

```bash
npm run reference:capture
npm run content:import
npm run content:check
```

Reference capture stores raw HTML and desktop/mobile screenshots in ignored `reference/`. Capture uses cached HTML; remove only relevant generated cache files when intentionally refreshing the source. Import uses Cheerio selectors, preserves IDs/slugs and writes generated content/asset manifests. A refresh requires review, asset authorization and a rebuild; this is not a runtime CMS.

## Production Prerequisites

1. Supply the licensed Jedira webfont files and confirm redistribution rights. This implementation self-hosts open-license Fraunces, Cormorant Garamond and Inter fallbacks; typography is not pixel-identical. Font licenses are included with the font packages.
2. Approve imported copy/images and review attributions. Photography and branding remain the property of their respective rights holders.
3. Configure and verify the inquiry endpoint in a delivery sandbox before enabling real submissions.
4. Approve legal copy, consent wording and actual data-handling practices. The imported cookie policy describes the original WordPress site and requires reconciliation with this build. Browser preferences persist locally; no non-essential analytics/marketing services are installed, regardless of opt-in. The original automated privacy-request backend is not replicated; requests use the displayed email contact. No compliance certification is implied.
5. Complete original-versus-rebuild visual review at 1440, 1024, 768, 390 and 360 pixels. Remaining differences include the licensed heading font, simplified consultation artwork, social-link presentation, gallery layout and some motion behavior. Do not declare exact visual parity based only on passing tests.
6. Configure static hosting for nested `index.html` routes, canonical slash redirects, a custom 404 response, HTTPS, CSP/security headers, and cache policies. Do not rewrite unknown URLs to a successful homepage response. Do not deploy the unused generated SSR entry as though this were a request-time SSR application.
7. Set the approved origin and indexing state explicitly when building:

```bash
SITE_ORIGIN=https://your-approved-domain.example SITE_INDEXABLE=true npm run build
```

The default build creates disallow-all robots, `noindex` metadata and loopback canonicals. The production flag creates an indexable robots file, route sitemap and configured canonicals. Never enable indexing for a preview or unauthorized replica. Deploy only `dist/dipali/browser`, retain the previous deployment for rollback, and smoke-test deep links, legal preferences and authorized inquiry delivery.
