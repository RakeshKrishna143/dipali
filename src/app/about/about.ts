import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ContentRepository } from '../content/content-repository';
import { PageHero } from '../shared/page-hero';
import { TestimonialsSection } from '../shared/testimonials-section';
import { ConsultationCta } from '../shared/consultation-cta';

@Component({
  imports: [NgOptimizedImage, PageHero, TestimonialsSection, ConsultationCta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  protected readonly content = inject(ContentRepository).content;
  protected readonly heading = this.content.pages['/about/'];
}
