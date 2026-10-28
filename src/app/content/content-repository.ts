import { Injectable } from '@angular/core';
import { ImageAsset, SiteContent } from './content.models';
import siteContent from './site-content.json';

function relativeImage(image: ImageAsset): ImageAsset {
  return { ...image, src: image.src.replace(/^\/assets\//, 'assets/') };
}

@Injectable({ providedIn: 'root' })
export class ContentRepository {
  readonly content: SiteContent = {
    ...siteContent,
    logo: relativeImage(siteContent.logo),
    mark: relativeImage(siteContent.mark),
    home: { ...siteContent.home, hero: relativeImage(siteContent.home.hero) },
    services: siteContent.services.map((service) => ({
      ...service,
      image: relativeImage(service.image),
      images: service.images.map(relativeImage),
    })),
    events: siteContent.events.map((event) => ({
      ...event,
      image: relativeImage(event.image),
      galleries: event.galleries.map((gallery) => ({
        ...gallery,
        images: gallery.images.map(relativeImage),
      })),
    })),
    about: siteContent.about.map((section) => ({
      ...section,
      image: relativeImage(section.image),
    })),
  };
  readonly services = this.content.services;
  readonly events = this.content.events;
  readonly reviews = this.content.reviews;

  service(slug: string) {
    return this.services.find((service) => service.slug === slug);
  }
  event(slug: string) {
    return this.events.find((event) => event.slug === slug);
  }
}
