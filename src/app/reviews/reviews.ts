import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentRepository } from '../content/content-repository';
import { PageHero } from '../shared/page-hero';
import { ConsultationCta } from '../shared/consultation-cta';
import { ReviewCard } from './review-card';

@Component({
  imports: [PageHero, ReviewCard, ConsultationCta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-hero
      [title]="heading.title"
      description="Five-star Google reviews from celebrations across Long Island, NYC, and New Jersey."
    />
    <section class="section">
      <div class="container review-grid">
        @for (review of repository.reviews; track review.id) {
          <app-review-card [review]="review" />
        }
      </div>
    </section>
    <app-consultation-cta />`,
  styles: `
    .review-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 50px;
    }
    @media (max-width: 760px) {
      .review-grid {
        grid-template-columns: 1fr;
        gap: 38px;
      }
    }
  `,
})
export class Reviews {
  protected readonly repository = inject(ContentRepository);
  protected readonly heading = this.repository.content.pages['/reviews/'];
}
