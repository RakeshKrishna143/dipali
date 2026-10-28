import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { ContentRepository } from '../content/content-repository';
import { ServiceCard } from '../services/service-card';
import { EventCard } from '../events/event-card';
import { SectionHeading } from '../shared/section-heading';
import { TestimonialsSection } from '../shared/testimonials-section';
import { ConsultationCta } from '../shared/consultation-cta';

@Component({
  imports: [
    RouterLink,
    NgOptimizedImage,
    ServiceCard,
    EventCard,
    SectionHeading,
    TestimonialsSection,
    ConsultationCta,
    LucideChevronLeft,
    LucideChevronRight,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly repository = inject(ContentRepository);
  protected readonly content = this.repository.content.home;
  protected readonly featuredEvents = this.repository.events.slice(0, 3);
  protected readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected readonly position = signal(0);

  protected slide(direction: number) {
    const track = this.track().nativeElement;
    const maximum = track.scrollWidth - track.clientWidth;
    const target = Math.min(maximum, Math.max(0, track.scrollLeft + direction * track.clientWidth));
    track.scrollTo({
      left: target,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
    this.position.set(maximum ? target / maximum : 0);
  }

  protected updatePosition() {
    const track = this.track().nativeElement;
    this.position.set(
      track.scrollWidth > track.clientWidth
        ? track.scrollLeft / (track.scrollWidth - track.clientWidth)
        : 0,
    );
  }
}
