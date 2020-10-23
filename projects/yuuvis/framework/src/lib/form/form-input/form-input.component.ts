import { Component, ElementRef, EventEmitter, HostBinding, Input, Output, Renderer2, ViewChild } from '@angular/core';

/**
 * Component for wrapping a form element. Provides a label and focus behaviour.
 *
 * @example
 * <yuv-form-input [label]="'my form element'">
 *   <!-- form element to be wrapped -->
 * </yuv-form-input>
 */
@Component({
  selector: 'yuv-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  host: { class: 'yuv-form-input' }
})
export class FormInputComponent {
  @ViewChild('label', { static: true }) labelEl: ElementRef;

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
   * You may also provide an array of error messages.
   */
  @Input('invalid')
  set invalid(iv: boolean | string[]) {
    if (iv === null || iv === undefined) {
      this.isInvalid = false;
      this.renderer.removeAttribute(this.labelEl.nativeElement, 'title');
    } else if (Array.isArray(iv)) {
      this.isInvalid = iv.length > 0;
      if (this.isInvalid) {
        this.renderer.setAttribute(this.labelEl.nativeElement, 'title', iv.join(';'));
      }
    } else {
      this.isInvalid = iv;
    }
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

  constructor(private renderer: Renderer2) {}

  toggle() {
    if (!this.skipToggle && !this.isDisabled) {
      this.toggled = !this.toggled;
      this.onToggleLabel.emit(this.toggled);
    }
  }
}
