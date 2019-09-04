import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

/**
 * Component for wrapping a form element. Provides a label and focus behaviour.
 */
@Component({
  selector: 'yuv-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  host: { class: 'yuv-form-input' }
})
export class FormInputComponent {
  toggled = false;
  _label: string;

  @Input('label')
  set label(val: string) {
    this._label = val;
  }

  @Input() tag: { label: string; title: string };
  @Input() description: string;
  @Input() skipToggle: boolean;

  @Input('isNull')
  set isNull(n: boolean) {
    this.toggled = n;
  }

  @Input('invalid')
  set invalid(iv: boolean) {
    this.isInvalid = iv;
  }

  @Input('disabled')
  set disabled(d: boolean) {
    this.isDisabled = d;
  }

  @Input('required')
  set required(d: boolean) {
    this.isRequired = d;
  }

  @HostBinding('class.disabled') isDisabled;
  @HostBinding('class.invalid') isInvalid;
  @HostBinding('class.required') isRequired;

  @Output() onToggleLabel = new EventEmitter<boolean>();

  toggle() {
    if (!this.skipToggle) {
      this.toggled = !this.toggled;
      this.onToggleLabel.emit(this.toggled);
    }
  }
}
