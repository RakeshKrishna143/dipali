import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventStory } from '../content/content.models';

@Component({
  selector: 'app-event-card',
  imports: [RouterLink, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a [routerLink]="['/event', event().slug]"
    ><img
      [ngSrc]="event().image.src"
      [alt]="event().image.alt"
      fill
      [disableOptimizedSrcset]="true"
      sizes="(max-width: 540px) 100vw, (max-width: 900px) 50vw, 33vw"
    />
    <h3>{{ event().title }}</h3></a
  >`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    a {
      position: relative;
      display: block;
      aspect-ratio: 3 / 4;
      overflow: hidden;
      background: var(--paper-warm);
    }
    a::after {
      content: '';
      position: absolute;
      inset: 45% 0 0;
      background: linear-gradient(transparent, rgb(0 0 0 / 65%));
    }
    img {
      object-fit: cover;
      transition: transform 0.6s;
    }
    a:hover img {
      transform: scale(1.035);
    }
    h3 {
      position: absolute;
      z-index: 1;
      bottom: 18px;
      inset-inline: 16px;
      margin: 0;
      color: var(--paper);
      font-size: 20px;
      line-height: 1.4;
    }
  `,
})
export class EventCard {
  readonly event = input.required<EventStory>();
}
