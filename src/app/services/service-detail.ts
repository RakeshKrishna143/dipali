import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Service } from '../content/content.models';
import { PageHero } from '../shared/page-hero';
import { ImageGallery } from '../shared/image-gallery';
import { TestimonialsSection } from '../shared/testimonials-section';
import { ConsultationCta } from '../shared/consultation-cta';

@Component({
  imports: [PageHero, ImageGallery, TestimonialsSection, ConsultationCta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-hero
      [title]="service().title"
      eyebrow="A Glimpse"
      backLink="/services"
      backLabel="Back to All Services"
    />
    <section class="section">
      <div class="container">
        <div class="service-copy">
          @for (paragraph of service().paragraphs; track $index) {
            <p>{{ paragraph }}</p>
          }
        </div>
        <app-image-gallery [images]="service().images" [label]="service().title + ' photographs'" />
        <div class="closing">
          <h2>{{ service().closing.title }}</h2>
          @for (paragraph of service().closing.paragraphs; track $index) {
            <p>{{ paragraph }}</p>
          }
        </div>
      </div>
    </section>
    <app-testimonials-section /><app-consultation-cta />`,
  styles: `
    .service-copy {
      max-width: 850px;
      margin-bottom: 36px;
    }
    .closing {
      max-width: 850px;
      margin: 48px auto 0;
      text-align: center;
    }
  `,
})
export class ServiceDetail {
  readonly service = input.required<Service>();
}
