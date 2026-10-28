import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { ContentRepository } from '../content/content-repository';
import { PageHero } from '../shared/page-hero';
import { ConsultationCta } from '../shared/consultation-cta';

@Component({
  imports: [PageHero, ConsultationCta, LucidePlus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-hero [title]="heading.title" />
    <section class="section">
      <div class="container">
        <div class="faq-list">
          @for (faq of content.faqs; track faq.question) {
            <details>
              <summary>{{ faq.question }}<svg lucidePlus aria-hidden="true"></svg></summary>
              <div class="answer">
                @for (paragraph of faq.answer; track $index) {
                  <p>{{ paragraph }}</p>
                }
              </div>
            </details>
          }
        </div>
      </div>
    </section>
    <app-consultation-cta />`,
  styles: `
    .faq-list {
      max-width: 900px;
      margin-inline: auto;
    }
    details {
      border-bottom: 1px solid var(--line);
    }
    details:first-child {
      border-top: 1px solid var(--line);
    }
    summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      list-style: none;
      cursor: pointer;
      font-family: var(--font-display);
      font-size: 23px;
      padding: 26px 0;
    }
    summary::-webkit-details-marker {
      display: none;
    }
    svg {
      flex: 0 0 20px;
      width: 20px;
      transition: transform 0.2s;
    }
    details[open] svg {
      transform: rotate(45deg);
    }
    .answer {
      max-width: 760px;
      padding-bottom: 15px;
      color: var(--ink-soft);
    }
    @media (max-width: 540px) {
      summary {
        font-size: 20px;
      }
    }
  `,
})
export class Faqs {
  protected readonly content = inject(ContentRepository).content;
  protected readonly heading = this.content.pages['/faqs/'];
}
