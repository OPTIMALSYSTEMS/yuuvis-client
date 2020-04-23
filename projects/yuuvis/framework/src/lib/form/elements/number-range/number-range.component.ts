import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { RangeValue, SearchFilter } from '@yuuvis/core';

/**
 * Creates form input for ranges of numeric values.
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 *
 * @example
 * <yuv-number-range [scale]="2"></yuv-number-range>
 *
 */
@Component({
  selector: 'yuv-number-range',
  templateUrl: './number-range.component.html',
  styleUrls: ['./number-range.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberRangeComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NumberRangeComponent),
      multi: true
    }
  ]
})
export class NumberRangeComponent implements ControlValueAccessor, Validator {
  /**
   * Number of decimal places
   */
  @Input() scale;
  /**
   * Overall amount of digits allowed (including decimal places)
   */
  @Input() precision;
  /**
   *  Set to true to group number by pattern
   */
  @Input() grouping;
  /**
   * The pattern to group number value by
   */
  @Input() pattern;
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;

  /**
   * classification property adds some semantics to the value of this component.
   * If you provide a value of `filesize` numbers typed into the control will be
   * handled like file sizes (calculates differnt units)
   */
  @Input() classification: string;
  /**
   * set minimum input value
   */
  @Input() minValue: number;
  /**
   * set maximum input value
   *
   */
  @Input() maxValue: number;

  public rangeForm = new FormGroup({
    numberValue: new FormControl(),
    numberValueFrom: new FormControl()
  });

  value: RangeValue;
  private isValid = true;

  // options for search situation
  public availableSearchOptions = [
    { label: SearchFilter.OPERATOR_LABEL.EQUAL, value: SearchFilter.OPERATOR.EQUAL },
    { label: SearchFilter.OPERATOR_LABEL.GREATER_OR_EQUAL, value: SearchFilter.OPERATOR.GREATER_OR_EQUAL },
    { label: SearchFilter.OPERATOR_LABEL.LESS_OR_EQUAL, value: SearchFilter.OPERATOR.LESS_OR_EQUAL },
    { label: SearchFilter.OPERATOR_LABEL.INTERVAL_INCLUDE_BOTH, value: SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH }
  ];
  // the selected search option
  public searchOption = this.availableSearchOptions[1].value;

  constructor() {
    this.rangeForm.valueChanges.forEach(() => {
      this.onValueChange();
    });
  }

  propagateChange = (_: any) => {};

  writeValue(value: RangeValue): void {
    if (value && value instanceof RangeValue && (value.firstValue != null || value.secondValue != null)) {
      const match = this.availableSearchOptions.find(o => o.value === value.operator);
      this.searchOption = match ? match.value : this.availableSearchOptions[0].value;

      this.value = value;
      if (value.secondValue == null) {
        this.rangeForm.setValue({
          numberValueFrom: null,
          numberValue: value.firstValue ? value.firstValue : null
        });
      } else {
        this.rangeForm.setValue({
          numberValueFrom: value.firstValue ? value.firstValue : null,
          numberValue: value.secondValue ? value.secondValue : null
        });
      }
    } else {
      this.value = null;
      this.rangeForm.reset();
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  onValueChange() {
    this.isValid = this.rangeForm.valid;
    if (this.searchOption === SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH) {
      this.isValid = this.rangeForm.valid && this.rangeForm.get('numberValueFrom').value != null && this.rangeForm.get('numberValue').value != null;
      this.value = !this.isValid
        ? new RangeValue(this.searchOption, null, null)
        : new RangeValue(this.searchOption, this.rangeForm.get('numberValueFrom').value, this.rangeForm.get('numberValue').value);
    } else {
      this.value = !this.isValid ? new RangeValue(this.searchOption, null) : new RangeValue(this.searchOption, this.rangeForm.get('numberValue').value);
    }
    this.propagateChange(this.value);
  }

  // returns null when valid else the validation object
  public validate(c: FormControl) {
    let err: any;
    if (this.searchOption === SearchFilter.OPERATOR.EQUAL) {
      err = { number: { valid: false } };
    } else if (this.searchOption === SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH && this.value.firstValue && this.value.secondValue) {
      // make sure that on ranges, the first value is earlier than the last
      this.isValid = this.value.firstValue < this.value.secondValue;
      err = { numberrangeorder: { valid: false } };
    } else {
      err = { numberrange: { valid: false } };
    }
    return this.isValid ? null : err;
  }
}
