import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { ContentRepository } from './content-repository';
import { EventStory, Service } from './content.models';

export const serviceResolver: ResolveFn<Service> = (route) => {
  const record = inject(ContentRepository).service(route.paramMap.get('slug') ?? '');
  return record ?? new RedirectCommand(inject(Router).parseUrl('/not-found'));
};

export const eventResolver: ResolveFn<EventStory> = (route) => {
  const record = inject(ContentRepository).event(route.paramMap.get('slug') ?? '');
  return record ?? new RedirectCommand(inject(Router).parseUrl('/not-found'));
};
