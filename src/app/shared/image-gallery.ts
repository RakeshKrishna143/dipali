import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import type PhotoSwipe from 'photoswipe';
import { ImageAsset } from '../content/content.models';

@Component({
  selector: 'app-image-gallery',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="photo-grid" [attr.aria-label]="label()">
      @for (image of images(); track image.src; let index = $index) {
        <a
          [href]="image.src"
          [attr.aria-label]="'Open photo ' + (index + 1) + ': ' + image.alt"
          (click)="open(index, $event)"
          ><img
            [ngSrc]="image.src"
            [alt]="image.alt"
            [width]="image.width"
            [height]="image.height"
            [disableOptimizedSrcset]="true"
            sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 25vw"
        /></a>
      }
    </div>
    @if (error()) {
      <p role="alert">
        The photo viewer could not load. <a [href]="error()">Open the photograph</a>.
      </p>
    }`,
  styles: `
    :host {
      display: block;
    }
    .photo-grid {
      columns: 4;
      column-gap: 0;
    }
    a {
      display: block;
      break-inside: avoid;
      overflow: hidden;
      background: var(--paper-warm);
    }
    img {
      width: 100%;
      height: auto;
      transition: transform 0.5s;
    }
    a:hover img {
      transform: scale(1.02);
    }
    p {
      margin: 20px;
    }
    p a {
      display: inline;
      text-decoration: underline;
    }
    @media (max-width: 900px) {
      .photo-grid {
        columns: 2;
      }
    }
    @media (max-width: 640px) {
      .photo-grid {
        columns: 1;
      }
    }
  `,
})
export class ImageGallery {
  readonly images = input.required<readonly ImageAsset[]>();
  readonly label = input('Event photographs');
  protected readonly error = signal('');
  private readonly destroyRef = inject(DestroyRef);
  private viewer?: PhotoSwipe;
  private loading = false;

  constructor() {
    this.destroyRef.onDestroy(() => this.viewer?.destroy());
  }

  protected async open(index: number, event: MouseEvent) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (this.loading) return;
    this.loading = true;
    try {
      const { default: Viewer } = await import('photoswipe');
      if (this.destroyRef.destroyed) return;
      this.viewer?.destroy();
      this.viewer = new Viewer({
        dataSource: this.images().map((image) => ({
          src: image.src,
          width: image.width,
          height: image.height,
          alt: image.alt,
        })),
        index,
        bgOpacity: 0.95,
        returnFocus: true,
        showHideAnimationType: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'none'
          : 'fade',
      });
      this.viewer.init();
      this.error.set('');
    } catch {
      this.error.set(this.images()[index].src);
    } finally {
      this.loading = false;
    }
  }
}
