import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { ContentRepository } from '../content/content-repository';
import { EventStory, Service } from '../content/content.models';
import { siteSettings } from '../content/site-settings';
import seoSettings from './seo-settings.json';

@Injectable()
export class SiteTitleStrategy extends TitleStrategy {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly repository = inject(ContentRepository);

  override updateTitle(snapshot: RouterStateSnapshot) {
    const title = this.buildTitle(snapshot) ?? siteSettings.name;
    this.title.setTitle(title);
    let route = snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const service = route.data['service'] as Service | undefined;
    const event = route.data['event'] as EventStory | undefined;
    const path = snapshot.url.split(/[?#]/)[0].replace(/\/$/, '') + '/';
    const description = (
      service?.paragraphs[0] ||
      event?.paragraphs[0] ||
      this.repository.content.pages[path]?.description ||
      siteSettings.description
    ).slice(0, 180);
    const canonical = new URL(path, seoSettings.origin).href;
    const image = service?.image ?? event?.image ?? this.repository.content.home.hero;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      name: 'robots',
      content:
        seoSettings.indexable &&
        route.routeConfig?.path !== '**' &&
        route.routeConfig?.path !== 'not-found'
          ? 'index, follow'
          : 'noindex, nofollow',
    });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({
      property: 'og:image',
      content: new URL(image.src, seoSettings.origin).href,
    });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = canonical;
  }
}
