import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { RangeValue, SearchFilter, TranslateService } from '@yuuvis/core';
import { LocaleDatePipe } from '../../../pipes/locale-date.pipe';

/**
 * Creates form input for date ranges. Based upon {@link DatetimeComponent}.
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 *
 * @example
 * <yuv-datetime-range></yuv-datetime-range>
 *
 */
@Component({
  selector: 'yuv-datetime-range',
  templateUrl: './datetime-range.component.html',
  styleUrls: ['./datetime-range.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatetimeRangeComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatetimeRangeComponent),
      multi: true
    }
  ]
})
export class DatetimeRangeComponent implements OnInit, ControlValueAccessor, Validator {
  /**
   * Title for the datepicker
   */
  @Input() pickerTitle: string;
  /**
   * Enables setting time as well (default: false)
   */
  @Input() withTime: boolean;
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;

  rangeForm: FormGroup;
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
  datePipe: LocaleDatePipe;

  constructor(private fb: FormBuilder, public translate: TranslateService) {
    this.datePipe = new LocaleDatePipe(translate);
  }

  createForm() {
    this.rangeForm = this.fb.group({
      dateValue: [],
      dateValueFrom: []
    });
  }

  onFormValueChange() {
    this.rangeForm.valueChanges.subscribe(() => this.onValueChange());
  }

  propagateChange = (_: any) => {};

  writeValue(value: RangeValue): void {
    if (value && value instanceof RangeValue && (value.firstValue || value.secondValue)) {
      let match = this.availableSearchOptions.find((o) => o.value === value.operator);
      this.searchOption = match ? match.value : this.availableSearchOptions[0].value;

      this.value = value;
      this.rangeForm.patchValue({
        dateValueFrom: value.secondValue && value.firstValue,
        dateValue: value.secondValue || value.firstValue
      });
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
    let dateValue = this.rangeForm.get('dateValue').value;
    if (this.searchOption === SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH) {
      let dateValueFrom = this.rangeForm.get('dateValueFrom').value;

      if (dateValueFrom || dateValue) {
        this.isValid = this.rangeForm.valid && !!dateValueFrom && !!dateValue;
        this.value = !this.isValid ? new RangeValue(this.searchOption, null, null) : new RangeValue(this.searchOption, dateValueFrom, dateValue);
      }
    } else {
      this.isValid = this.rangeForm.valid;
      this.value = !this.isValid ? new RangeValue(this.searchOption, null) : new RangeValue(this.searchOption, dateValue);
    }

    this.propagateChange(this.value);
  }

  // returns null when valid else the validation object
  public validate(c: FormControl) {
    let err;
    if (this.searchOption === SearchFilter.OPERATOR.EQUAL) {
      err = {
        datecontrol: {
          valid: false
        }
      };
    } else {
      // make sure that on ranges, the first value is earlier than the last
      if (this.searchOption === SearchFilter.OPERATOR.INTERVAL_INCLUDE_BOTH && this.value && this.value.firstValue && this.value.secondValue) {
        this.isValid = new Date(this.value.firstValue).getTime() < new Date(this.value.secondValue).getTime();
        err = {
          daterangeorder: {
            valid: false
          }
        };
      } else {
        err = {
          daterange: {
            valid: false
          }
        };
      }
    }
    return this.isValid ? null : err;
  }

  ngOnInit() {
    this.createForm();
    this.onFormValueChange();
  }
}
