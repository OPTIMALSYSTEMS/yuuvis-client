import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Classification, ClassificationEntry, SystemService } from '@yuuvis/core';

@Component({
  selector: 'yuv-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CatalogComponent),
      multi: true
    }
  ]
})
export class CatalogComponent implements ControlValueAccessor {
  value: string;
  _options: { label: string; value: string }[];
  /**
   * Possibles values are `EDIT` (default),`SEARCH`,`CREATE`. In search situation validation of the form element will be turned off, so you are able to enter search terms that do not meet the elements validators.
   */
  @Input() situation: string;
  @Input() options(options: string[]) {
    this._options = options.map((o) => ({
      label: o,
      value: o
    }));
  }
  /**
   * Additional semantics for the form element.
   */
  @Input() set classification(c: string[]) {
    const ce: ClassificationEntry = this.systemService.getClassifications(c).get(Classification.STRING_CATALOG);
    if (ce && ce.options) {
      this._options = ce.options.map((o) => ({
        label: o,
        value: o
      }));
    }
  }
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;

  constructor(private systemService: SystemService) {}

  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    this.value = value === undefined ? null : value;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}
}
