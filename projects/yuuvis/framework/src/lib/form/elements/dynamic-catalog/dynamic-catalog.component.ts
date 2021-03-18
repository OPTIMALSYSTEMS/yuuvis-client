import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BackendService, Classification, ClassificationEntry, SystemService } from '@yuuvis/core';

@Component({
  selector: 'yuv-dynamic-catalog',
  templateUrl: './dynamic-catalog.component.html',
  styleUrls: ['./dynamic-catalog.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicCatalogComponent),
      multi: true
    }
  ]
})
export class DynamicCatalogComponent implements ControlValueAccessor {
  value: string;
  // TODO: Take user role into account
  editable: boolean;

  /**
   * Possibles values are `EDIT` (default),`SEARCH`,`CREATE`. In search situation validation of the form element will be turned off, so you are able to enter search terms that do not meet the elements validators.
   */
  @Input() situation: string;
  /**
   * Indicator that multiple items could be selected
   */
  @Input() multiselect: boolean;
  /**
   * Additional semantics for the form element.
   */
  @Input() set classifications(c: string[]) {
    const ce: ClassificationEntry = this.systemService.getClassifications(c).get(Classification.STRING_CATALOG_DYNAMIC);
    if (ce && ce.options && ce.options.length) {
      // first option is the name of the catalog to load ...
      this.fetchCatalogEntries(ce.options[0]);
      // ... optional second option indicates whether or not this catalog is readonly
      this.editable = !ce.options[1] || ce.options[1] !== 'readonly';
    }
  }
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;

  constructor(private systemService: SystemService, private backend: BackendService) {}

  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    this.value = value || null;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  onChange(value) {
    this.value = value;
    this.propagateChange(this.value);
  }

  private fetchCatalogEntries(catalog: string) {
    this.backend.get(`/catalog/`).subscribe();
  }
}
