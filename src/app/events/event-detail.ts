import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EventStory } from '../content/content.models';
import { PageHero } from '../shared/page-hero';
import { ImageGallery } from '../shared/image-gallery';
import { TestimonialsSection } from '../shared/testimonials-section';
import { ConsultationCta } from '../shared/consultation-cta';

@Component({
  imports: [PageHero, ImageGallery, TestimonialsSection, ConsultationCta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-hero
      [title]="event().title"
      backLink="/gallery"
      backLabel="Back to All Events"
    />
    <div class="container section">
      @if (event().venue) {
        <div class="venue">
          <span class="eyebrow">Venue</span>
          <p>{{ event().venue }}</p>
        </div>
      }
      @if (event().paragraphs.length) {
        <div class="story">
          <span class="eyebrow">The Story</span>
          @for (paragraph of event().paragraphs; track $index) {
            <p>{{ paragraph }}</p>
          }
        </div>
      }
      @for (gallery of event().galleries; track gallery.title) {
        <section class="gallery-section">
          <h2>{{ gallery.title }}</h2>
          <app-image-gallery [images]="gallery.images" [label]="gallery.title + ' photographs'" />
        </section>
      }
    </div>
    <app-testimonials-section /><app-consultation-cta />`,
  styles: `
    .venue {
      border-bottom: 1px solid var(--line);
      padding-bottom: 20px;
      margin-bottom: 36px;
    }
    .venue .eyebrow {
      margin-bottom: 8px;
    }
    .story {
      max-width: 850px;
      margin-bottom: 48px;
    }
    .gallery-section + .gallery-section {
      margin-top: 56px;
    }
  `,
})
export class EventDetail {
  readonly event = input.required<EventStory>();
}
