import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const requiredText: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };

export function minimumEventDate(now = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export const eventDateValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value: unknown = control.value;
  if (!value) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { eventDate: true };
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
    return { eventDate: true };
  return value >= minimumEventDate() ? null : { eventDate: true };
};

export const integerValidator: ValidatorFn = (control) =>
  control.value === null || Number.isInteger(control.value) ? null : { integer: true };

export function optionValidator(options: readonly string[]): ValidatorFn {
  return (control) => (!control.value || options.includes(control.value) ? null : { option: true });
}
