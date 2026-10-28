import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { eventResolver, serviceResolver } from './content/content-resolvers';
import { ContentRepository } from './content/content-repository';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home/home').then((module) => module.Home),
    title: 'House of Dipali | Wedding Decor & Design',
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about').then((module) => module.About),
    title: 'About | House of Dipali',
  },
  {
    path: 'services',
    loadComponent: () => import('./services/service-list').then((module) => module.ServiceList),
    title: 'Services | House of Dipali',
  },
  {
    path: 'service/:slug',
    loadComponent: () => import('./services/service-detail').then((module) => module.ServiceDetail),
    resolve: { service: serviceResolver },
    title: (route) =>
      `${inject(ContentRepository).service(route.paramMap.get('slug') ?? '')?.title ?? 'Service'} | House of Dipali`,
  },
  {
    path: 'gallery',
    loadComponent: () => import('./events/event-list').then((module) => module.EventList),
    title: 'Gallery | House of Dipali',
  },
  {
    path: 'event/:slug',
    loadComponent: () => import('./events/event-detail').then((module) => module.EventDetail),
    resolve: { event: eventResolver },
    title: (route) =>
      `${inject(ContentRepository).event(route.paramMap.get('slug') ?? '')?.title ?? 'Event'} | House of Dipali`,
  },
  {
    path: 'reviews',
    loadComponent: () => import('./reviews/reviews').then((module) => module.Reviews),
    title: 'Reviews | House of Dipali',
  },
  {
    path: 'faqs',
    loadComponent: () => import('./faqs/faqs').then((module) => module.Faqs),
    title: 'FAQs | House of Dipali',
  },
  {
    path: 'venues',
    loadComponent: () => import('./venues/venues').then((module) => module.Venues),
    title: 'Venues | House of Dipali',
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact').then((module) => module.Contact),
    title: 'Contact | House of Dipali',
  },
  {
    path: 'opt-out-preferences',
    loadComponent: () =>
      import('./legal/privacy-preferences').then((module) => module.PrivacyPreferences),
    title: 'Opt-out Preferences | House of Dipali',
  },
  {
    path: 'not-found',
    loadComponent: () => import('./shared/not-found').then((module) => module.NotFound),
    title: 'Page Not Found | House of Dipali',
  },
  {
    path: '**',
    loadComponent: () => import('./shared/not-found').then((module) => module.NotFound),
    title: 'Page Not Found | House of Dipali',
  },
];
