import { RenderMode, ServerRoute } from '@angular/ssr';
import { inject } from '@angular/core';
import { ContentRepository } from './content/content-repository';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'service/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      inject(ContentRepository).services.map((service) => ({ slug: service.slug })),
  },
  {
    path: 'event/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      inject(ContentRepository).events.map((event) => ({ slug: event.slug })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
