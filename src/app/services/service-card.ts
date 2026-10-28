import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Service } from '../content/content.models';

@Component({
  selector: 'app-service-card',
  imports: [RouterLink, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a [routerLink]="['/service', service().slug]"
    ><div class="photo">
      <img
        [ngSrc]="service().image.src"
        [alt]="service().image.alt"
        fill
        [disableOptimizedSrcset]="true"
        sizes="(max-width: 540px) 100vw, (max-width: 900px) 50vw, 33vw"
      />
    </div>
    <div class="copy">
      <h3>{{ service().title }}</h3>
      <p>{{ service().summary }}</p>
    </div></a
  >`,
  styles: `
    :host {
      display: block;
      min-width: 0;
      height: 100%;
    }
    a {
      display: block;
      height: 100%;
      border: 1px solid var(--line-light);
    }
    .photo {
      position: relative;
      aspect-ratio: 4 / 5;
      overflow: hidden;
    }
    img {
      object-fit: cover;
      transition: transform 0.6s;
    }
    a:hover img {
      transform: scale(1.035);
    }
    .copy {
      padding: 24px;
    }
    h3 {
      margin-bottom: 10px;
      font-size: 22px;
    }
    p {
      margin: 0;
      font-size: 14px;
      opacity: 0.85;
    }
  `,
})
export class ServiceCard {
  readonly service = input.required<Service>();
}
