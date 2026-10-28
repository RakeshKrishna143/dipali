import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { InquiryApi } from './inquiry-api';
import { InquiryPayload } from './inquiry.models';

describe('InquiryApi', () => {
  let api: InquiryApi;
  let http: HttpTestingController;
  const payload: InquiryPayload = {
    firstName: 'Test',
    lastName: 'Couple',
    phone: '9175550123',
    email: 'test@example.com',
    eventDate: '2027-08-20',
    eventType: 'Wedding Ceremony',
    eventLocation: 'Oheka Castle',
    eventBudget: '25k - 50k',
    guestCount: 150,
    message: 'Test inquiry',
    referralSource: 'Google Search',
    consent: true,
    website: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(InquiryApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('sends one inquiry to the configured endpoint and requires confirmation', async () => {
    const response = firstValueFrom(api.submit(payload));
    http.expectOne('site-config.json').flush({ inquiryEndpoint: '/api/inquiries' });
    const request = http.expectOne('/api/inquiries');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ success: true, reference: 'test-reference' });
    await expect(response).resolves.toEqual({ success: true, reference: 'test-reference' });
  });

  it('does not simulate successful delivery when no endpoint is configured', async () => {
    const response = firstValueFrom(api.submit(payload));
    const assertion = expect(response).rejects.toThrow('temporarily unavailable');
    http.expectOne('site-config.json').flush({ inquiryEndpoint: '' });
    await assertion;
    http.expectNone('/api/inquiries');
  });

  it('rejects an unconfirmed response without automatically repeating the POST', async () => {
    const response = firstValueFrom(api.submit(payload));
    const assertion = expect(response).rejects.toThrow('could not be confirmed');
    http.expectOne('site-config.json').flush({ inquiryEndpoint: '/api/inquiries' });
    http.expectOne('/api/inquiries').flush({ success: false });
    await assertion;
    http.expectNone('/api/inquiries');
  });
});
