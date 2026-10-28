import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-consultation-cta',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section class="section consultation">
    <div class="container">
      <div class="divider" aria-hidden="true"></div>
      <h2>Start designing your celebration.</h2>
      <p>
        Tell us about your event, and our team will reach out to schedule a complimentary
        consultation.
      </p>
      <a class="button primary" routerLink="/contact">Book a Consultation</a>
    </div>
  </section>`,
  styles: `
    :host {
      display: block;
    }
    .consultation {
      text-align: center;
      padding-bottom: 80px;
    }
    .divider {
      height: 1px;
      max-width: 340px;
      margin: 0 auto 54px;
      background: var(--line);
    }
    h2 {
      max-width: 600px;
      margin-inline: auto;
    }
    p {
      max-width: 550px;
      margin: 0 auto 30px;
      color: var(--ink-soft);
    }
  `,
})
export class ConsultationCta {}
