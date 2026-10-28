import { Injectable } from '@angular/core';
import { SiteContent } from './content.models';
import siteContent from './site-content.json';

@Injectable({ providedIn: 'root' })
export class ContentRepository {
  readonly content: SiteContent = siteContent;
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
