import { Component, ElementRef, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { Classification, Utils } from '@yuuvis/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { envelope, globe, phone } from '../../../svg.generated';
import { Situation } from './../../../object-form/object-form.situation';
/**
 * Creates form input for strings. Based on the input values different kinds of inputs will be generated.
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 *
 * @example
 * <!-- string input validating input to be between 5 and 10 characters -->
 * <yuv-string [minLength]="5" [maxLength]="10"></yuv-string>
 *
 * <!-- string input that only allow digits -->
 * <yuv-string  [regex]="[0-9]*"></yuv-string>
 *
 * <!-- string input rendering a large textarea -->
 * <yuv-string [multiline]="true" [size]="'large'"></yuv-string>
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
  maxEntryCountIfInvalid = null;

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
   * Additional semantics for the form element. Possible values are
   * `email` (validates and creates a link to send an email once there
   * is a valid email address) and `url` (validates and creates a link
   * to an URL typed into the form element).
   */
  @Input() set classification(c: string[]) {
    this._classification = c;
    if (c && c.length) {
      if (c.includes(Classification.STRING_EMAIL)) {
        this.classify = {
          hrefPrefix: 'mailto:',
          icon: 'envelope'
        };
      } else if (c.includes(Classification.STRING_URL)) {
        this.classify = {
          hrefPrefix: '',
          icon: 'globe'
        };
      } else if (c.includes(Classification.STRING_PHONE)) {
        this.classify = {
          hrefPrefix: 'tel:',
          icon: 'phone'
        };
      }
    }
  }

  get classification() {
    return this._classification;
  }
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
  validationErrors = [];
  classify: { hrefPrefix: string; icon: string };
  private _classification: string[];

  constructor(private elementRef: ElementRef, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([envelope, globe, phone]);
  }

  propagateChange = (_: any) => {};

  private propagate() {
    this.propagateChange(this.value);
  }

  writeValue(value: any): void {
    this.value = value || null;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  onValueChange(val) {
    this.maxEntryCountIfInvalid = null;
    this.validationErrors = [];

    if (Utils.isEmpty(val)) {
      this.value = null;
      this.propagate();

      return;
    }

    const multiCheck = (check) => !!(this.multiselect ? val : [val]).find((v) => check(v));

    // validate regular expression
    if (this.regex && multiCheck((v) => !RegExp(this.regex).test(v))) {
      this.validationErrors.push({ key: 'regex' });
    }

    // validate classification settings
    if (this.classification && this.classification.length) {
      this.classification.forEach((c) => {
        if (multiCheck((v) => !this.validateClassification(v, c))) {
          this.validationErrors.push({ key: 'classification' + c });
        }
      });
    }
    // validate min length
    if (!Utils.isEmpty(this.minLength) && multiCheck((v) => v.length < this.minLength)) {
      this.validationErrors.push({ key: 'minlength', params: { minLength: this.minLength } });
    }

    // validate max length
    if (!Utils.isEmpty(this.maxLength) && multiCheck((v) => v.length > this.maxLength)) {
      this.validationErrors.push({ key: 'maxlength', params: { maxLength: this.maxLength } });
    }

    // validate invalid if only whitespaces
    if (multiCheck((v) => v.length && !v.trim().length)) {
      this.validationErrors.push({ key: 'onlyWhitespaces' });
    }

    if (this.validationErrors.length && this.multiselect && this.value) {
      // Setting maxEntryCountIfInvalid to the actual length of the value array to prevent the user to add more entries.
      this.maxEntryCountIfInvalid = this.value.length;
    }
    this.propagate();
  }

  onBlur() {
    if (this.trimValue()) {
      this.propagate();
    }
  }

  /**
   * Trims the current value and returns wether or not it has been trimmed
   */
  private trimValue(): boolean {
    if (this.value) {
      if (this.multiselect) {
        const lengthBefore = this.value.join('').length;
        this.value = this.value.map((v) => v.trim());
        return this.value.join('').length !== lengthBefore;
      } else {
        const lengthBefore = this.value.length;
        this.value = this.value.trim();
        return this.value.length !== lengthBefore;
      }
    }
    return false;
  }

  private validateClassification(string: string, classification: string): boolean {
    if (this.situation === Situation.SEARCH) {
      return true;
    } else {
      let pattern;
      if (classification === Classification.STRING_EMAIL) {
        pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      } else if (classification === Classification.STRING_URL) {
        pattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
      } else if (classification === Classification.STRING_PHONE) {
        pattern = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;
      }
      return pattern ? pattern.test(string) : false;
    }
  }

  /**
   * returns null when valid else the validation object
   */
  public validate(c: FormControl) {
    if (this.validationErrors.length) {
      this.valid = false;
      return Utils.arrayToObject(this.validationErrors, 'key', (err) => ({ valid: false, ...err }));
    } else {
      this.valid = true;
      return null;
    }
  }
}
