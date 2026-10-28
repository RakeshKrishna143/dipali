import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './shell/site-header';
import { SiteFooter } from './shell/site-footer';

@Component({
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
  template: `<a class="skip-link" href="#main-content">Skip to content</a><app-site-header />
    <main id="main-content" tabindex="-1"><router-outlet /></main>
    <app-site-footer />`,
})
export class App {}
