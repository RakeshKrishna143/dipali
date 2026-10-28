import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentRepository } from '../content/content-repository';
import { ReviewCard } from '../reviews/review-card';
import { SectionHeading } from './section-heading';

@Component({
  selector: 'app-testimonials-section',
  imports: [RouterLink, ReviewCard, SectionHeading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="section">
    <div class="container">
      <app-section-heading [heading]="heading" />
      <div class="card-grid">
        @for (review of reviews; track review.id) {
          <app-review-card [review]="review" [compact]="true" />
        }
      </div>
      <div class="section-actions">
        <a class="text-link" routerLink="/reviews">Read More Reviews</a>
      </div>
    </div>
  </section>`,
})
export class TestimonialsSection {
  protected readonly reviews = inject(ContentRepository).reviews.slice(0, 3);
  protected readonly heading = {
    eyebrow: 'Kind Words',
    title: 'From our couples.',
    description:
      'Five-star Google reviews from celebrations across Long Island, NYC, and New Jersey.',
  };
}
