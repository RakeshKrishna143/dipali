import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentRepository } from '../content/content-repository';
import { siteSettings } from '../content/site-settings';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  protected readonly settings = siteSettings;
  protected readonly logo = inject(ContentRepository).content.logo;
  protected readonly year = new Date().getFullYear();
}
