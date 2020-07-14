import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Classification, ClassificationEntry, SystemService } from '@yuuvis/core';

/**
 * Component rendering a simple catalog as form element.
 * There are two ways how to use this component. One is to add options as an array
 * of strings on your own, the second one is to apply a special classification.
 *
 * Classifications are used within form models and rendered as object forms. Elements
 * with a classification of `catalog[Item1, Item2, Item3]` will use this component
 * as well. So you may also choose to set a classification like this in order to
 * apply your options.
 *
 * @example
 * <!-- setting options as string array -->
 * <yuv-catalog [options]="cities" [(ngModel)]="hometown"></yuv-catalog>
 *
 * <!-- setting options using a classification -->
 * <yuv-catalog [classification]="'catalog[Berlin, Chicago, Paris]'" [(ngModel)]="hometown"></yuv-catalog>
 */
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
  /**
   * Array of selectable entries
   */
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

  onChange(value) {
    this.value = value;
    this.propagateChange(this.value);
  }
}
