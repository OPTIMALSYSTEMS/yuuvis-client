import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { SVGIcons } from '../../../svg.generated';

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
  icons = {
    envelope: SVGIcons.envelope,
    globe: SVGIcons.globe
  };

  /**
   * lala ding dong
   */
  @Input() multiselect: boolean;
  @Input() multiline: boolean;
  @Input() readonly: boolean;
  @Input() autofocus: boolean;

  @Input() classification: string;
  @Input() situation: string;
  @Input() regex: string;
  // @Input() qname: string;
  // could be small, medium, large
  @Input() size: string;
  @Input() minLength: number;
  @Input() maxLength: number;

  // model value
  value;
  valid: boolean;

  constructor() {}

  propagateChange = (_: any) => {};

  onKeyUpEnter(event) {
    const input = event.target.value.trim();
    if (input) {
      this.value = this.value ? this.value : [];
      this.value = [...this.value, input];
      this.propagateChange(this.value);
      event.target.value = '';
    }
  }

  writeValue(value: any): void {
    this.value = value || null;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  onValueChange(evt) {
    this.value = evt.length ? evt : null;
    this.propagateChange(this.value);
  }

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

  // returns null when valid else the validation object
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
