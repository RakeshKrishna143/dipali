import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Review } from '../content/content.models';

@Component({
  selector: 'app-review-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article
    [id]="compact() ? null : review().id"
    [attr.aria-label]="'Review by ' + review().name"
  >
    <span class="quote-mark" aria-hidden="true">&ldquo;</span>
    <blockquote [class.compact]="compact()">
      <p>{{ review().quote }}</p>
    </blockquote>
    @if (compact()) {
      <a class="text-link" routerLink="/reviews" [fragment]="review().id">Read the full review</a>
    }
    <p class="meta">
      <strong>{{ review().name }}</strong> &middot; {{ review().occasion }} &middot;
      {{ review().date }} &middot; Google review
    </p>
  </article>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    article {
      border-top: 1px solid var(--line);
      padding-top: 18px;
      scroll-margin-top: 110px;
    }
    .quote-mark {
      display: block;
      color: var(--copper);
      font-family: Georgia, serif;
      font-size: 42px;
      line-height: 1;
    }
    blockquote {
      margin: 14px 0 22px;
      font-family: var(--font-accent);
      font-style: italic;
      color: var(--ink-soft);
      font-size: 23px;
      line-height: 1.65;
    }
    blockquote p {
      margin: 0;
    }
    .compact {
      display: -webkit-box;
      -webkit-line-clamp: 6;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .meta {
      font-size: 12px;
      margin: 16px 0 0;
      color: var(--ink-soft);
    }
    strong {
      color: var(--ink);
      font-weight: 600;
    }
  `,
})
export class ReviewCard {
  readonly review = input.required<Review>();
  readonly compact = input(false);
}
