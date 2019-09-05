import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { SVGIcons } from '../../../svg.generated';

/**
 * # yuv-string
 *
 * Creates form input for strings. Based on the input values different kinds of inputs will be generated.
 *
 * ```html
<yuv-string [minLength]="5" [maxLength]="10"></yuv-string>
```
 *
 */
@Component({
  selector: 'yuv-string',
  templateUrl: './string.component.html',
  styleUrls: ['./string.component.scss'],
  host: { class: 'yuv-string' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StringComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => StringComponent),
      multi: true
    }
  ]
})
export class StringComponent implements ControlValueAccessor, Validator {
  /**
   * @ignore
   */
  icons = {
    envelope: SVGIcons.envelope,
    globe: SVGIcons.globe
  };

  /**
   * Indicator that multiple strings could be inserted, they will be rendered as chips (default: false).
   */
  @Input() multiselect: boolean;
  /**
   * Set to true to render a textarea instead of input (default: false)
   */
  @Input() multiline: boolean;
  /**
   * Use in combination with `multiline` to define the size (height) of the textarea. Valid values are 'small','medium','large'
   */
  @Input() size: string;
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;
  /**
   * Enable autofucus for the input (default: false)
   */
  @Input() autofocus: boolean;
  /**
   * Possible values are `email` (validates and creates a link to send an email once there is a valid email address) and `url` (validates and creates a link to an URL typed into the form element).
   */
  @Input() classification: string;
  /**
   * Possibles values are `EDIT` (default),`SEARCH`,`CREATE`. In search situation validation of the form element will be turned off, so you are able to enter search terms that do not meet the elements validators.
   */
  @Input() situation: string;

  /**
   * Regular expression to validate the input value against
   */
  @Input() regex: string;
  /**
   * Minimal number of characters
   */
  @Input() minLength: number;
  /**
   * Maximum number of characters
   */
  @Input() maxLength: number;

  // model value
  value;
  valid: boolean;

  constructor() {}
  /**
   * @ignore
   */
  propagateChange = (_: any) => {};

  /**
   * @ignore
   */

  onKeyUpEnter(event) {
    const input = event.target.value.trim();
    if (input) {
      this.value = this.value ? this.value : [];
      this.value = [...this.value, input];
      this.propagateChange(this.value);
      event.target.value = '';
    }
  }
  /**
   * @ignore
   */
  writeValue(value: any): void {
    this.value = value || null;
  }
  /**
   * @ignore
   */
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  /**
   * @ignore
   */
  registerOnTouched(fn: any): void {}
  /**
   * @ignore
   */
  onValueChange(evt) {
    this.value = evt.length ? evt : null;
    this.propagateChange(this.value);
  }
  /**
   * @ignore
   */
  onBlur() {
    if (this.value) {
      if (this.multiselect) {
        this.value = this.value.map(v => v.trim());
      } else {
        this.value = this.value.trim();
      }
    }
  }

  private validateClassification(string): boolean {
    if (this.situation === 'SEARCH') {
      return true;
    } else {
      let pattern;
      if (this.classification === 'email') {
        pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      } else if (this.classification === 'url') {
        pattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
      }
      return pattern ? pattern.test(string) : false;
    }
  }

  /**
   * @ignore
   * returns null when valid else the validation object
   */
  public validate(c: FormControl) {
    let err;
    // validate regular expression
    if (this.value && this.regex) {
      if (this.multiselect) {
        if (this.value.length > 0 && !!this.value.find(v => !RegExp(this.regex).test(v))) {
          err = {};
          err['regex'] = {
            valid: false
          };
        }
      } else {
        if (!RegExp(this.regex).test(this.value)) {
          err = {};
          err['regex'] = {
            valid: false
          };
        }
      }
    }
    // validate classification settings
    if (this.value && this.classification) {
      if (this.multiselect) {
        for (let v of this.value) {
          if (!this.validateClassification(v)) {
            err = {};
            err['classification' + this.classification] = {
              valid: false
            };
          }
        }
      } else {
        if (!this.validateClassification(this.value)) {
          err = {};
          err['classification' + this.classification] = {
            valid: false
          };
        }
      }
    }
    // validate length here when multiselect
    if (this.value && this.value !== null) {
      if (this.multiselect) {
        if (this.value.length > 0 && !!this.value.find(v => v.length < this.minLength)) {
          err = {};
          err['minlength'] = {
            valid: false
          };
        }
        if (this.value.length > 0 && !!this.value.find(v => v.length > this.maxLength)) {
          err = {};
          err['maxlength'] = {
            valid: false
          };
        }
      } else {
        if (this.value.length > 0 && this.value.length < this.minLength) {
          err = {};
          err['minlength'] = {
            valid: false
          };
        }
        if (this.value.length > this.maxLength) {
          err = {};
          err['maxlength'] = {
            valid: false
          };
        }
      }
    }
    // validate invalid if only whitespaces
    if (this.value && this.value !== null) {
      if (this.multiselect) {
        for (let v of this.value) {
          if (v.length && !v.trim().length) {
            err = {};
            err['onlyWhitespaces'] = {
              valid: false
            };
          }
        }
      } else {
        if (this.value.length && !this.value.trim().length) {
          err = {};
          err['onlyWhitespaces'] = {
            valid: false
          };
        }
      }
    }
    this.valid = !err;
    return err ? err : null;
  }
}
