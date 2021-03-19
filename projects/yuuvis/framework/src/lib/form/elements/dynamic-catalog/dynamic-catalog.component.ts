import { Component, forwardRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Catalog, CatalogService, Classification, ClassificationEntry, SystemService } from '@yuuvis/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { PopoverConfig } from '../../../popover/popover.interface';
import { PopoverRef } from '../../../popover/popover.ref';
import { PopoverService } from '../../../popover/popover.service';
import { edit } from '../../../svg.generated';

/**
 * Form input component for displaying dynamic catalogs.
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 *
 * @example
 * <yuv-dynamic-catalog [multiselect]="true"></yuv-dynamic-catalog>
 */
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
  ],
  host: { class: 'yuv-catalog' }
})
export class DynamicCatalogComponent implements ControlValueAccessor {
  @ViewChild('tplCatalogManager') tplCatalogManager: TemplateRef<any>;

  catalog: Catalog;
  value: string | string[];
  innerValue: any;
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
   * By default a filter panel will shown if the number of options exceeds 10 entries. You could
   * change this number.
   */
  @Input() enableFilterWhenOptionsExceed: number = 10;
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

  constructor(
    private systemService: SystemService,
    private popoverService: PopoverService,
    private iconRegistry: IconRegistryService,
    private catalogService: CatalogService
  ) {
    this.iconRegistry.registerIcons([edit]);
  }

  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    this.value = value || null;
    this.innerValue = value ? { name: value } : null;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  onChange(value) {
    this.value = value ? (Array.isArray(value) ? value.map((v) => v.name) : value.name) : null;
    this.propagateChange(this.value);
  }

  openManager() {
    const popoverConfig: PopoverConfig = {
      width: '55%',
      height: '70%',
      data: {
        // catalog: this.catalog
        catalog: {
          name: 'lala',
          namespace: 'namespace',
          entries: [
            { name: '11', disabled: false },
            { name: '12', disabled: false },
            { name: '13', disabled: true },
            { name: '14', disabled: false }
          ]
        }
      }
    };
    this.popoverService.open(this.tplCatalogManager, popoverConfig);
  }

  /**
   * Triggered when the catalog management component changed the current catalog.
   * @param updatedCatalog Updated catalog
   * @param popoverRef Reference to the popover instance
   */
  catalogChanged(updatedCatalog: Catalog, popoverRef?: PopoverRef) {
    if (popoverRef) {
      popoverRef.close();
    }
  }

  private fetchCatalogEntries(catalog: string) {
    this.catalogService.getCatalog(catalog).subscribe(
      (res: Catalog) => {
        this.catalog = res;
      },
      (err) => {
        if (err.status === 404) {
          // we'll get a 404 if the catalog could not be found. Thats fine. Now
          // we know that we have to POST instead of PATCH if we are going to edit the catalog
        } else {
          throw err;
        }
      }
    );
  }
}
