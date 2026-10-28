import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LegalSection } from '../content/content.models';
import { siteSettings } from '../content/site-settings';
import { PageHero } from '../shared/page-hero';
import legalContent from './legal-content.json';

@Component({
  imports: [PageHero],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-page-hero title="Opt-out preferences" />
    <section class="section">
      <div class="container legal">
        <section class="preferences" aria-labelledby="preferences-heading">
          <h2 id="preferences-heading">Your preferences</h2>
          <p>These choices apply to this browser. You can update them at any time.</p>
          <label><input type="checkbox" checked disabled /> Functional (always active)</label
          ><label
            ><input
              type="checkbox"
              [checked]="preferences().statistics"
              (change)="setPreference('statistics', $event)"
            />
            Statistics</label
          ><label
            ><input
              type="checkbox"
              [checked]="preferences().marketing"
              (change)="setPreference('marketing', $event)"
            />
            Marketing</label
          ><button class="button primary" (click)="save()">Save Preferences</button>
          <p role="status">{{ status() }}</p>
          <p>
            <a class="text-link" [href]="privacyEmail"
              >Contact Us About Your Personal Information</a
            >
          </p>
        </section>
        @for (section of sections; track $index) {
          <section class="legal-section">
            @if (section.title) {
              <h2>{{ section.title }}</h2>
            }
            @for (paragraph of section.paragraphs; track $index) {
              <p>{{ paragraph }}</p>
            }
          </section>
        }
      </div>
    </section>`,
  styles: `
    .legal {
      max-width: 1000px;
    }
    .preferences {
      border-block: 1px solid var(--line);
      padding: 30px 0;
      margin-bottom: 40px;
    }
    .preferences h2 {
      font-size: 30px;
    }
    label {
      display: flex;
      gap: 12px;
      align-items: center;
      margin: 16px 0;
    }
    input {
      accent-color: var(--rose);
      width: 18px;
      height: 18px;
    }
    .preferences button {
      margin: 16px 0;
    }
    .legal-section {
      margin: 32px 0;
    }
    .legal-section h2 {
      font-size: 28px;
    }
    p {
      overflow-wrap: anywhere;
    }
  `,
})
export class PrivacyPreferences {
  protected readonly sections: readonly LegalSection[] = legalContent;
  protected readonly privacyEmail = `mailto:${siteSettings.email}?subject=Privacy%20request`;
  protected readonly preferences = signal({ statistics: false, marketing: false });
  protected readonly status = signal('');

  constructor() {
    afterNextRender(() => {
      try {
        const stored: unknown = JSON.parse(
          localStorage.getItem('dipali-privacy-preferences') ?? 'null',
        );
        if (
          stored &&
          typeof stored === 'object' &&
          'statistics' in stored &&
          'marketing' in stored
        ) {
          this.preferences.set({
            statistics: stored.statistics === true,
            marketing: stored.marketing === true,
          });
        }
      } catch {
        this.status.set('Your browser could not load saved preferences.');
      }
    });
  }

  protected setPreference(key: 'statistics' | 'marketing', event: Event) {
    this.preferences.update((current) => ({
      ...current,
      [key]: (event.target as HTMLInputElement).checked,
    }));
    this.status.set('');
  }

  protected save() {
    try {
      localStorage.setItem('dipali-privacy-preferences', JSON.stringify(this.preferences()));
      this.status.set('Your preferences have been saved.');
    } catch {
      this.status.set(
        'Your browser could not save these preferences. Non-essential cookies remain disabled.',
      );
    }
  }
}
