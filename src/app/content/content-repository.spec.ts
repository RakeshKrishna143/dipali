import { ContentRepository } from './content-repository';

describe('ContentRepository', () => {
  const repository = new ContentRepository();

  it('provides one canonical record per service and event slug', () => {
    expect(repository.services).toHaveLength(7);
    expect(repository.events).toHaveLength(13);
    for (const records of [repository.services, repository.events]) {
      expect(new Set(records.map((record) => record.slug)).size).toBe(records.length);
      for (const record of records) {
        expect(record.title).toBeTruthy();
        expect(record.image.src).toMatch(/^assets\/images\//);
      }
    }
  });

  it('uses the same records for listings and detail lookups', () => {
    expect(repository.service(repository.services[0].slug)).toBe(repository.services[0]);
    expect(repository.event(repository.events[0].slug)).toBe(repository.events[0]);
    expect(repository.service('missing')).toBeUndefined();
    expect(repository.event('missing')).toBeUndefined();
  });

  it('resolves every image relative to root and GitHub Pages base URLs', () => {
    const images = [
      repository.content.logo,
      repository.content.mark,
      repository.content.home.hero,
      ...repository.services.flatMap((service) => [service.image, ...service.images]),
      ...repository.events.flatMap((event) => [
        event.image,
        ...event.galleries.flatMap((gallery) => gallery.images),
      ]),
      ...repository.content.about.map((section) => section.image),
    ];
    for (const image of images) {
      expect(image.src).toMatch(/^assets\/images\//);
      expect(new URL(image.src, 'https://example.com/').pathname).toBe(`/${image.src}`);
      expect(new URL(image.src, 'https://example.github.io/dipali/').pathname).toBe(
        `/dipali/${image.src}`,
      );
    }
  });

  it('preserves stable, unique review anchors and complete supporting content', () => {
    expect(new Set(repository.reviews.map((review) => review.id)).size).toBe(
      repository.reviews.length,
    );
    expect(repository.reviews.some((review) => review.id === 'review-9426')).toBe(true);
    expect(repository.content.faqs).toHaveLength(5);
    expect(repository.content.venues).toHaveLength(4);
    expect(
      repository.events.every((event) =>
        event.galleries.every((gallery) => gallery.images.length > 0),
      ),
    ).toBe(true);
  });
});
