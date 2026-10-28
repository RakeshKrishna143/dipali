import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentRepository } from '../content/content-repository';
import { PageHero } from '../shared/page-hero';
import { ConsultationCta } from '../shared/consultation-cta';

@Component({
  imports: [PageHero, RouterLink, ConsultationCta],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-hero [title]="heading.title" />
    <section class="section">
      <div class="container">
        <p>
          We bring a thoughtful, full-service approach to wedding decor at venues across the
          Tri-State area.
        </p>
        <p class="legend">
          <span aria-hidden="true">&#9733;</span> House of Dipali is a preferred vendor here
        </p>
        <div class="regions">
          @for (group of content.venues; track group.region) {
            <section>
              <h2>{{ group.region }}</h2>
              <ul>
                @for (venue of group.venues; track venue.name) {
                  <li>
                    <span class="venue-name"
                      >{{ venue.name }}
                      @if (venue.preferred) {
                        <span class="preferred" aria-label="Preferred vendor">&#9733;</span>
                      }</span
                    ><span class="city">{{ venue.city }}</span>
                  </li>
                }
              </ul>
            </section>
          }
        </div>
        <div class="more">
          <p>Working with a venue that isn't listed? We've decorated 100+ venues.</p>
          <a class="text-link" routerLink="/contact">Ask Us About Yours</a>
        </div>
      </div>
    </section>
    <app-consultation-cta />`,
  styles: `
    .regions {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 32px;
      margin-top: 40px;
    }
    h2 {
      font-size: 26px;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      display: flex;
      flex-direction: column;
      border-top: 1px solid var(--line);
      padding: 14px 0;
    }
    .venue-name {
      font-size: 14px;
    }
    .city {
      font-size: 12px;
      color: var(--ink-soft);
    }
    .legend {
      font-size: 12px;
      color: var(--ink-soft);
    }
    .preferred,
    .legend span {
      color: var(--rose);
    }
    .more {
      margin-top: 48px;
      text-align: center;
    }
    @media (max-width: 1000px) {
      .regions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    @media (max-width: 540px) {
      .regions {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class Venues {
  protected readonly content = inject(ContentRepository).content;
  protected readonly heading = this.content.pages['/venues/'];
}
