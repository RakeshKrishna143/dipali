import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentRepository } from '../content/content-repository';
import { PageHero } from '../shared/page-hero';
import { ConsultationCta } from '../shared/consultation-cta';
import { ServiceCard } from './service-card';

@Component({
  imports: [PageHero, ServiceCard, ConsultationCta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-hero [title]="heading.title" />
    <section class="section">
      <div class="container">
        <p class="intro">
          From ceremony to reception, each service is designed to work together as one cohesive
          story.
        </p>
        <div class="card-grid">
          @for (service of repository.services; track service.slug) {
            <app-service-card [service]="service" />
          }
        </div>
      </div>
    </section>
    <app-consultation-cta />`,
  styles: `
    .intro {
      max-width: 700px;
      margin-bottom: 32px;
      color: var(--ink-soft);
    }
  `,
})
export class ServiceList {
  protected readonly repository = inject(ContentRepository);
  protected readonly heading = this.repository.content.pages['/services/'];
}
