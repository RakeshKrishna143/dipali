import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, switchMap, throwError, timeout } from 'rxjs';
import { InquiryPayload, InquiryResponse, SiteConfiguration } from './inquiry.models';

@Injectable({ providedIn: 'root' })
export class InquiryApi {
  private readonly http = inject(HttpClient);

  submit(payload: InquiryPayload) {
    return this.http.get<SiteConfiguration>('/site-config.json').pipe(
      switchMap((configuration) => {
        if (
          !configuration.inquiryEndpoint ||
          !/^(https:\/\/|\/(?!\/))/.test(configuration.inquiryEndpoint)
        ) {
          return throwError(
            () =>
              new Error(
                'Online inquiries are temporarily unavailable. Please call 917-753-3745 or email info@dipali.com.',
              ),
          );
        }
        return this.http.post<unknown>(configuration.inquiryEndpoint, payload);
      }),
      timeout(20000),
      map((response) => {
        if (
          typeof response !== 'object' ||
          response === null ||
          !('success' in response) ||
          response.success !== true
        ) {
          throw new Error(
            'Your inquiry could not be confirmed. Please call 917-753-3745 before trying again.',
          );
        }
        return response as InquiryResponse;
      }),
    );
  }
}
