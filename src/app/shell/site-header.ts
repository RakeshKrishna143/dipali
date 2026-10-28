import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { LucideMenu, LucideX } from '@lucide/angular';
import { ContentRepository } from '../content/content-repository';
import { siteSettings } from '../content/site-settings';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage, LucideMenu, LucideX],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly settings = siteSettings;
  protected readonly mark = inject(ContentRepository).content.mark;
  protected readonly scrolled = signal(false);
  protected readonly home = signal(true);
  protected readonly menu = viewChild.required<ElementRef<HTMLDialogElement>>('menu');
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  constructor() {
    const router = inject(Router);
    this.home.set(router.url === '/');
    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.home.set(event.urlAfterRedirects.split(/[?#]/)[0] === '/');
        if (this.menu().nativeElement.open) this.menu().nativeElement.close();
      });
  }

  @HostListener('window:scroll')
  protected updateScroll() {
    this.scrolled.set(window.scrollY > 24);
  }
  protected openMenu() {
    this.menu().nativeElement.showModal();
  }
  protected closeMenu() {
    this.menu().nativeElement.close();
  }
  protected restoreFocus() {
    this.trigger().nativeElement.focus();
  }
}
