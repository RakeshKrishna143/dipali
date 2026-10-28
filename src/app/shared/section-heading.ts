import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PageHeading } from '../content/content.models';

@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="section-heading">
    @if (heading().eyebrow) {
      <span class="eyebrow">{{ heading().eyebrow }}</span>
    }
    <h2>{{ heading().title }}</h2>
    @if (heading().description) {
      <p>{{ heading().description }}</p>
    }
  </div>`,
  styles: `
    :host {
      display: block;
    }
    .section-heading {
      max-width: 800px;
      text-align: center;
      margin: 0 auto 40px;
    }
    p {
      max-width: 680px;
      margin: 0 auto;
      opacity: 0.85;
    }
  `,
})
export class SectionHeading {
  readonly heading = input.required<PageHeading>();
}
