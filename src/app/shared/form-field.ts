import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<label [for]="controlId()"
      >{{ label() }}
      @if (required()) {
        <span aria-hidden="true"> *</span>
      }</label
    ><ng-content />
    <div class="field-bottom">
      <span [id]="controlId() + '-error'" class="error">{{ error() }}</span>
      @if (maximum()) {
        <span class="count" aria-hidden="true">{{ count() }}/{{ maximum() }}</span>
      }
    </div>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    label {
      display: block;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 9px;
    }
    .field-bottom {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      min-height: 23px;
      margin-top: 4px;
      font-size: 11px;
      line-height: 1.5;
    }
    .error {
      color: #962e40;
    }
    .count {
      color: var(--ink-soft);
      margin-left: auto;
    }
  `,
})
export class FormField {
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly error = input('');
  readonly required = input(true);
  readonly count = input(0);
  readonly maximum = input(0);
}
