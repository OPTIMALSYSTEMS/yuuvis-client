import { Component, forwardRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Catalog, CatalogEntry, CatalogService, Classification, ClassificationEntry, SystemService, UserService } from '@yuuvis/core';
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

  catalog: Catalog;
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
    const ce: ClassificationEntry = this.systemService.getClassifications(c).get(Classification.STRING_CATALOG_DYNAMIC);
    if (ce && ce.options && ce.options.length) {
      // first option is the name of the catalog to load ...
      this.fetchCatalogEntries(ce.options[0]);
      // ... optional second option indicates whether or not this catalog is readonly
      this.editable = this.situation === 'SEARCH' || (this.userService.hasManageSettingsRole && (!ce.options[1] || ce.options[1] !== 'readonly'));
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
    private catalogService: CatalogService,
    private userService: UserService
  ) {
    this.iconRegistry.registerIcons([edit, clear]);
  }

  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    this.value = value || null;
    // this.innerValue = value ? { name: value } : null;
    this.setupInnerValue();
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
    if (popoverRef) {
      popoverRef.close();
    }
  }

  removeInvalidItems() {
    if (Array.isArray(this.innerValue)) {
      const fiv = [];
      this.innerValue.forEach((iv) => {
        if (iv.missing) {
          this.value = (this.value as string[]).filter((v) => v !== iv.name);
        } else {
          fiv.push(iv);
        }
      });
      this.innerValue = fiv;
      this.hasInvalidItems = false;
    }
  }

  private fetchCatalogEntries(catalog: string) {
    // catalogs name could contain a namespace: [tenKolibri:myCatalog]
    const tokens = catalog.split(':');
    (tokens.length === 1 ? this.catalogService.getCatalog(catalog) : this.catalogService.getCatalog(tokens[1], tokens[0])).subscribe(
      (res: Catalog) => {
        this.setCatalog(res);
        this.setupInnerValue();
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

  private setupInnerValue() {
    if (this.value && this.catalog) {
      if (Array.isArray(this.value)) {
        const iv = [];
        this.value.forEach((v) => {
          const ce = this.catalog.entries.find((e) => e.name === v);
          iv.push(
            ce || {
              name: v,
              missing: true
            }
          );
          if (!ce) this.hasInvalidItems = true;
        });
        this.innerValue = iv;
      } else {
        const ce = this.catalog.entries.find((e) => e.name === this.value);
        this.innerValue = ce || {
          name: this.value,
          missing: true
        };
        if (!ce) this.hasInvalidItems = true;
      }
    }
  }

  private setCatalog(catalog: Catalog) {
    this.catalog = catalog;
    this.enabledCatalogEntries = this.situation === 'SEARCH' ? catalog.entries : catalog.entries.filter((e) => !e.disabled);
  }
}
