import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { RangeValue, SearchFilter } from '@yuuvis/core';

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
  @Input() scale;
  @Input() precision;
  @Input() grouping;
  @Input() pattern;
  @Input() readonly: boolean;

  public rangeForm = new FormGroup({
    numberValue: new FormControl(),
    numberValueFrom: new FormControl()
  });

  value: RangeValue;
  private isValid = true;

  // options for search situation
  public availableSearchOptions = [
    { label: RangeValue.getOperatorLabel(SearchFilter.OPERATOR.EQUAL), value: SearchFilter.OPERATOR.EQUAL },
    { label: RangeValue.getOperatorLabel(SearchFilter.OPERATOR.GREATER_OR_EQUAL), value: SearchFilter.OPERATOR.GREATER_OR_EQUAL },
    { label: RangeValue.getOperatorLabel(SearchFilter.OPERATOR.LESS_OR_EQUAL), value: SearchFilter.OPERATOR.LESS_OR_EQUAL },
    { label: RangeValue.getOperatorLabel(SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH), value: SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH }
  ];
  // the selected search option
  public searchOption = this.availableSearchOptions[0].value;

  constructor() {
    this.rangeForm.valueChanges.forEach(() => {
      this.onValueChange();
    });
  }

  propagateChange = (_: any) => {};

  writeValue(value: RangeValue): void {
    if (value && value instanceof RangeValue && (value.firstValue != null || value.secondValue != null)) {
      let match = this.availableSearchOptions.find(o => o.value === value.operator);
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
    let err;
    if (this.searchOption === SearchFilter.OPERATOR.EQUAL) {
      err = {
        number: {
          valid: false
        }
      };
    } else {
      err = {
        numberrange: {
          valid: false
        }
      };
    }
    return this.isValid ? null : err;
  }
}
