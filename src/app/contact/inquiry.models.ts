export interface InquiryPayload {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly email: string;
  readonly eventDate: string;
  readonly eventType: string;
  readonly eventLocation: string;
  readonly eventBudget: string;
  readonly guestCount: number;
  readonly message: string;
  readonly referralSource: string;
  readonly consent: boolean;
  readonly website: string;
}

export interface InquiryResponse {
  readonly success: true;
  readonly reference?: string;
}
export interface SiteConfiguration {
  readonly inquiryEndpoint: string;
}
