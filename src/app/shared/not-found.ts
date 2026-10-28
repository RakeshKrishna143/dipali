import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHero } from './page-hero';

@Component({
  imports: [PageHero, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-hero
      title="Page not found."
      eyebrow="404"
      description="The page you are looking for may have moved or is no longer available."
    />
    <div class="container section"><a class="button primary" routerLink="/">Return Home</a></div>`,
})
export class NotFound {}
