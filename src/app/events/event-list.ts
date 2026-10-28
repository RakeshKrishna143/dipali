import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentRepository } from '../content/content-repository';
import { PageHero } from '../shared/page-hero';
import { ConsultationCta } from '../shared/consultation-cta';
import { EventCard } from './event-card';

@Component({
  imports: [PageHero, EventCard, ConsultationCta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-hero [title]="heading.title" />
    <section class="section">
      <div class="container card-grid">
        @for (event of repository.events; track event.slug) {
          <app-event-card [event]="event" />
        }
      </div>
    </section>
    <app-consultation-cta />`,
})
export class EventList {
  protected readonly repository = inject(ContentRepository);
  protected readonly heading = this.repository.content.pages['/gallery/'];
}
