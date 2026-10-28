import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import {
  LucideArrowRight,
  LucideCheck,
  LucideMail,
  LucideMapPin,
  LucidePhone,
} from '@lucide/angular';
import { ContentRepository } from '../content/content-repository';
import { siteSettings } from '../content/site-settings';
import { PageHero } from '../shared/page-hero';
import { FormField } from '../shared/form-field';
import { TestimonialsSection } from '../shared/testimonials-section';
import { InquiryApi } from './inquiry-api';
import {
  eventDateValidator,
  integerValidator,
  minimumEventDate,
  optionValidator,
  requiredText,
} from './inquiry.validators';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PageHero,
    FormField,
    TestimonialsSection,
    LucideArrowRight,
    LucideCheck,
    LucideMail,
    LucideMapPin,
    LucidePhone,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  protected readonly settings = siteSettings;
  protected readonly content = inject(ContentRepository).content;
  protected readonly options = this.content.formOptions;
  protected readonly earliestDate = signal(minimumEventDate());
  protected readonly submitted = signal(false);
  protected readonly state = signal<'idle' | 'pending' | 'success' | 'error'>('idle');
  protected readonly message = signal('');
  protected readonly formElement = viewChild.required<ElementRef<HTMLFormElement>>('formElement');
  private readonly builder = inject(FormBuilder).nonNullable;
  private readonly api = inject(InquiryApi);
  protected readonly form = this.builder.group({
    firstName: ['', [requiredText, Validators.maxLength(40)]],
    lastName: ['', [requiredText, Validators.maxLength(80)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    eventDate: ['', [Validators.required, eventDateValidator]],
    eventType: ['', [Validators.required, optionValidator(this.options.eventType)]],
    eventLocation: ['', [requiredText, Validators.maxLength(120)]],
    eventBudget: ['', [Validators.required, optionValidator(this.options.budget)]],
    guestCount: [
      null as number | null,
      [Validators.required, Validators.min(1), Validators.max(999), integerValidator],
    ],
    message: ['', Validators.maxLength(5000)],
    referralSource: ['', [Validators.required, optionValidator(this.options.referralSource)]],
    consent: [false, Validators.requiredTrue],
    website: [''],
  });

  constructor() {
    afterNextRender(() => this.earliestDate.set(minimumEventDate()));
    this.form.events
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.formRevision.update((value) => value + 1));
  }

  private readonly formRevision = signal(0);

  protected errorFor(name: keyof typeof this.form.controls): string {
    this.formRevision();
    const control = this.form.controls[name];
    if (!control.invalid || (!control.touched && !this.submitted())) return '';
    if (control.hasError('required'))
      return name === 'consent'
        ? 'Please confirm your consent before submitting.'
        : 'This field is required.';
    if (control.hasError('email')) return 'Enter a valid email address.';
    if (control.hasError('pattern')) return 'Enter a 10-digit phone number, without spaces.';
    if (control.hasError('eventDate')) return 'Choose a date at least 14 days from today.';
    if (control.hasError('min') || control.hasError('max') || control.hasError('integer'))
      return 'Enter a whole number between 1 and 999.';
    if (control.hasError('maxlength')) return 'Please shorten this entry.';
    if (control.hasError('server')) return 'Please check this field and try again.';
    return 'Choose one of the available options.';
  }

  protected async submit() {
    if (this.state() === 'pending') return;
    this.submitted.set(true);
    this.form.markAllAsTouched();
    this.form.controls.eventDate.updateValueAndValidity();
    if (this.form.invalid) {
      this.formElement()
        .nativeElement.querySelector<HTMLElement>(
          'input.ng-invalid, select.ng-invalid, textarea.ng-invalid',
        )
        ?.focus();
      return;
    }
    this.state.set('pending');
    this.message.set('');
    const value = this.form.getRawValue();
    try {
      await firstValueFrom(
        this.api.submit({
          ...value,
          firstName: value.firstName.trim(),
          lastName: value.lastName.trim(),
          email: value.email.trim(),
          eventLocation: value.eventLocation.trim(),
          message: value.message.trim(),
          guestCount: value.guestCount!,
        }),
      );
      this.state.set('success');
      this.form.reset();
      this.submitted.set(false);
      this.message.set(
        'Thank you. Your inquiry has been received. Our team will be in touch to arrange your consultation.',
      );
    } catch (error) {
      this.state.set('error');
      if (error instanceof HttpErrorResponse) {
        this.message.set(
          error.status === 429
            ? 'Too many attempts. Please wait a few minutes before trying again.'
            : 'Your inquiry could not be sent. Please try again or reach us directly by phone or email.',
        );
      } else {
        this.message.set(
          error instanceof Error && error.name !== 'TimeoutError'
            ? error.message
            : 'We could not confirm delivery. Please contact us directly before submitting again.',
        );
      }
    }
  }
}
