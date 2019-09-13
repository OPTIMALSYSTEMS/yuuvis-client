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

  /**
   * A label string for the wrapped form element
   */
  @Input('label')
  set label(val: string) {
    this._label = val;
  }

  /**
   * A tag that can be applied to the input (including title that shows up once the user hovers the tag)
   */
  @Input() tag: { label: string; title: string };
  /**
   * Optional description for the form input
   */
  @Input() description: string;
  /**
   * Clicking the label will by default set a 'Not set' flag to the input. This is useful when you are for
   * example trying to indicate that a value is suposed to be not set instead of beeing just empty.
   */
  @Input() skipToggle: boolean;

  @Input('isNull')
  set isNull(n: boolean) {
    this.toggled = n;
  }

  /**
   * Indicator that the wrapped form element is invalid. Will then render appropriate styles.
   */
  @Input('invalid')
  set invalid(iv: boolean) {
    this.isInvalid = iv;
  }
  /**
   * Indicator that the wrapped form element is disabled. Will then render appropriate styles.
   */
  @Input('disabled')
  set disabled(d: boolean) {
    this.isDisabled = d;
  }

  /**
   * Indicator that the wrapped form element is mandatory. Will then render appropriate styles.
   */
  @Input('required')
  set required(d: boolean) {
    this.isRequired = d;
  }

  /**
   * Emits whether or not the input was set to 'Not set' state. Requires input `skipToggle` to be false.
   */
  @Output() onToggleLabel = new EventEmitter<boolean>();

  @HostBinding('class.disabled') isDisabled;
  @HostBinding('class.invalid') isInvalid;
  @HostBinding('class.required') isRequired;

  toggle() {
    if (!this.skipToggle) {
      this.toggled = !this.toggled;
      this.onToggleLabel.emit(this.toggled);
    }
  }
}
