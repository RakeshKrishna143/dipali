import { FormControl } from '@angular/forms';
import {
  eventDateValidator,
  integerValidator,
  minimumEventDate,
  optionValidator,
  requiredText,
} from './inquiry.validators';

describe('Inquiry validators', () => {
  afterEach(() => vi.useRealTimers());

  it('requires meaningful text instead of whitespace', () => {
    expect(requiredText(new FormControl('  '))).toEqual({ required: true });
    expect(requiredText(new FormControl(' Dipali '))).toBeNull();
  });

  it('calculates the 14-day lead time across month and year boundaries', () => {
    expect(minimumEventDate(new Date(2026, 11, 24))).toBe('2027-01-07');
    expect(minimumEventDate(new Date(2028, 1, 20))).toBe('2028-03-05');
  });

  it('validates real date-only values and enforces the minimum lead time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 27, 12));
    expect(eventDateValidator(new FormControl('2026-11-10'))).toBeNull();
    expect(eventDateValidator(new FormControl('2026-11-09'))).toEqual({ eventDate: true });
    expect(eventDateValidator(new FormControl('2027-02-30'))).toEqual({ eventDate: true });
    expect(eventDateValidator(new FormControl('not-a-date'))).toEqual({ eventDate: true });
  });

  it('rejects fractional guest counts and unrecognized dropdown values', () => {
    expect(integerValidator(new FormControl(1.5))).toEqual({ integer: true });
    expect(integerValidator(new FormControl(150))).toBeNull();
    const validate = optionValidator(['Wedding Ceremony', 'Wedding Reception']);
    expect(validate(new FormControl('Wedding Ceremony'))).toBeNull();
    expect(validate(new FormControl('Invalid'))).toEqual({ option: true });
  });
});
