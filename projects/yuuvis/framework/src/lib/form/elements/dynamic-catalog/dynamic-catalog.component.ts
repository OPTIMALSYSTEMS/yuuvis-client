import { Component, forwardRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseCatalog, Catalog, CatalogEntry, CatalogService, Classification, ClassificationEntry, SystemService, UserService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { PopoverConfig } from '../../../popover/popover.interface';
import { PopoverRef } from '../../../popover/popover.ref';
import { PopoverService } from '../../../popover/popover.service';
import { clear, edit } from '../../../svg.generated';

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

  catalog: BaseCatalog | Catalog;
  enabledCatalogEntries: CatalogEntry[] = [];
  value: string | string[];
  innerValue: any;
  editable: boolean;
  hasInvalidItems: boolean;

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
    const ces = this.systemService.getClassifications(c);
    this.fetchCatalogEntries(
      ces.get(ces.has(Classification.STRING_CATALOG_DYNAMIC) ? Classification.STRING_CATALOG_DYNAMIC : Classification.STRING_CATALOG_CUSTOM)
    );
  }
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;
  /**
   * Will attch the overlay to this HTMLelement
   */
  @Input() appendTo = null;

  constructor(
    private systemService: SystemService,
    private popoverService: PopoverService,
    private iconRegistry: IconRegistryService,
    private catalogService: CatalogService,
    private userService: UserService
  ) {
    this.iconRegistry.registerIcons([edit, clear]);
  }

  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    this.value = value || null;
    this.setupInnerValue();
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  onChange(value: any) {
    this.writeValue(value ? (Array.isArray(value) ? value.map((v) => v.name) : value.name) : null);
    this.propagateChange(this.value);
  }

  openManager() {
    const popoverConfig: PopoverConfig = {
      width: '55%',
      height: '70%',
      data: {
        catalog: this.catalog
      }
    };
    this.popoverService.open(this.tplCatalogManager, popoverConfig);
  }

  /**
   * Triggered when the catalog management component changed the current catalog.
   * @param updatedCatalog Updated catalog
   * @param popoverRef Reference to the popover instance
   */
  catalogSaved(updatedCatalog: Catalog, popoverRef?: PopoverRef) {
    this.setCatalog(updatedCatalog);
    popoverRef?.close();
  }

  removeInvalidItems() {
    this.onChange(Array.isArray(this.innerValue) ? this.innerValue.filter((i) => !i.missing && !i.disabled) : null);
  }

  private fetchCatalogEntries(ce: ClassificationEntry) {
    if (ce && ce.options && ce.options.length) {
      // first classification option is the name of the catalog to load ...
      this.loadCatalog(ce).subscribe(
        (res: BaseCatalog) => {
          this.setCatalog(res);
          this.editable =
            this.situation !== 'SEARCH' &&
            this.userService.hasManageSettingsRole &&
            !res.readonly &&
            ce.classification === Classification.STRING_CATALOG_DYNAMIC;
        },
        (err) => {
          if (err.status === 404) {
            // we'll get a 404 if the catalog could not be found. Thats fine. Now
            // we know that we have to POST instead of PATCH if we are going to edit the catalog
            this.readonly = true;
            this.editable = false;
            // TODO: Once there is a POST endpoint on the dms-controller catalog could be created from here
          } else {
            throw err;
          }
        }
      );
    }
  }

  private loadCatalog(ce: ClassificationEntry): Observable<BaseCatalog> {
    return ce.classification === Classification.STRING_CATALOG_CUSTOM
      ? this.catalogService.getCustomCatalog(ce.options[0])
      : this.catalogService.getCatalog(ce.options[0]);
  }

  private resolveEntry(value: string): CatalogEntry {
    return (
      this.catalog.entries?.find((e) => e.name === value) || {
        name: value,
        missing: true
      }
    );
  }

  private setupInnerValue() {
    if (this.value && this.catalog) {
      const value = Array.isArray(this.value) ? this.value : [this.value];
      const innerValue = value.map((v) => this.resolveEntry(v));
      this.hasInvalidItems = !!innerValue.find((i) => i.missing || i.disabled);
      this.innerValue = Array.isArray(this.value) ? innerValue : innerValue[0];
    } else {
      this.hasInvalidItems = false;
      this.innerValue = null;
    }
  }

  private setCatalog(catalog: BaseCatalog | Catalog) {
    this.catalog = catalog || { entries: [] };
    this.situation === 'SEARCH' && this.catalog.entries?.forEach((e) => (e.disabled = false));
    const value = Array.isArray(this.value) ? this.value : [this.value];
    this.enabledCatalogEntries = this.catalog.entries?.filter((e) => !e.disabled || value.includes(e.name)) || [];
    this.setupInnerValue();
  }
}
