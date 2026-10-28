import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-hero',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="page-hero">
    <div class="container">
      @if (backLink()) {
        <a class="back-link" [routerLink]="backLink()">&larr; {{ backLabel() }}</a>
      }
      @if (eyebrow()) {
        <span class="eyebrow">{{ eyebrow() }}</span>
      }
      <h1>{{ title() }}</h1>
      @if (description()) {
        <p>{{ description() }}</p>
      }
    </div>
  </section>`,
  styles: `
    :host {
      display: block;
    }
    .page-hero {
      padding: calc(var(--header-height) + 40px) 0 12px;
    }
    h1 {
      max-width: 1000px;
      font-size: 48px;
    }
    p {
      max-width: 720px;
      color: var(--ink-soft);
    }
    .back-link {
      display: inline-block;
      font-size: 11px;
      text-transform: uppercase;
      margin-bottom: 24px;
      color: var(--rose);
      letter-spacing: 1px;
    }
    @media (max-width: 540px) {
      h1 {
        font-size: 34px;
      }
      .page-hero {
        padding-top: calc(var(--header-height) + 28px);
      }
    }
  `,
})
export class PageHero {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly eyebrow = input('');
  readonly backLink = input('');
  readonly backLabel = input('');
}
