import { AfterViewInit, Component, EventEmitter, forwardRef, HostBinding, HostListener, Inject, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import {
  BaseObjectTypeField,
  Classification,
  ClassificationEntry,
  SearchFilter,
  SearchQuery,
  SearchQueryProperties,
  SearchResult,
  SearchService,
  SystemService,
  Utils
} from '@yuuvis/core';
import { AutoComplete } from 'primeng/autocomplete';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { ROUTES, YuvRoutes } from '../../../routing/routes';
import { noAccessTitle as noAccess } from '../../../shared/utils';
import { reference } from '../../../svg.generated';
import { ReferenceEntry } from './reference.interface';

/**
 * Creates a form element for adding references to other dms objects.
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 *
 * @example
 * <yuv-reference (objectSelect)="referencesChanges($event)"></yuv-reference>
 */
@Component({
  selector: 'yuv-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReferenceComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ReferenceComponent),
      multi: true
    }
  ]
})
export class ReferenceComponent implements ControlValueAccessor, Validator, AfterViewInit {
  @ViewChild('autocomplete') autoCompleteInput: AutoComplete;
  private objectTypeBaseProperties = this.systemService.getBaseProperties();
  noAccessTitle = noAccess;
  minLength = 2;

  private isValidInput = true;
  value;
  _innerValue: ReferenceEntry[] = [];
  set innerValue(iv: ReferenceEntry[]) {
    this._innerValue = iv;
    this.objectSelect.emit(iv);
  }
  get innerValue() {
    return this._innerValue;
  }
  autocompleteRes: any[] = [];
  path: string;

  // prevent ENTER from being propagated, because the component could be located
  // inside some other component that also relys on ENTER
  @HostListener('keydown.enter', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    event.stopPropagation();
  }

  @HostBinding('class.inputDisabled') _inputDisabled: boolean;
  /**
   * Possibles values are `EDIT` (default),`SEARCH`,`CREATE`. In search situation validation of the form element will be turned off, so you are able to enter search terms that do not meet the elements validators.
   */
  @Input() situation: string;
  /**
   * Indicator that multiple strings could be inserted, they will be rendered as chips (default: false).
   */
  @Input() multiselect: boolean;
  /**
   * Set this to true and the component will try to gain focus once it has been rendered.
   * Notice that this is not reliable. If there are any other components that are rendered
   * later and also try to be focused, they will 'win', because there can only be one focus.
   */
  @Input() autofocus: boolean;
  /**
   * Additional semantics for the form element. You could specify restrictions on what object
   * type should be allowed by setting eg. `['id:reference[system:folder]']` to only allow folders
   */
  @Input() set classifications(c: string[]) {
    const ce: ClassificationEntry = this.systemService.getClassifications(c).get(Classification.STRING_REFERENCE);
    if (ce && ce.options) {
      this.allowedTargetTypes = ce.options;
    }
  }
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;
  /**
   * You can provide a template reference here that will be rendered at the end of each
   * quickfinder result item.
   *
   *Use case: Add a router link of your host application that opens
   * the object in a new tab/window.
   */
  @Input() entryLinkTemplate: TemplateRef<any>;

  /**
   * Minimal number of characters to trigger search (default: 2)
   */
  @Input() minChars: number = 2;
  /**
   * Maximal number of suggestions for the given search term (default: 10)
   */
  @Input() maxSuggestions: number = 10;

  /**
   * Set to 'true' reference chips will not contain links to the selected item
   */
  @Input() links: boolean = true;

  /**
   * Restrict the suggestions to a list of allowed target object types.
   */
  @Input() allowedTargetTypes: string[] = [];

  /**
   * Restrict the suggestions based on custom filters.
   */
  @Input() filters: any[] = [];

  /**
   * Fields to be returned in SearchResult.
   */
  @Input() objectTypeFields: string[] = [];

  /**
   * Function to search via custom SearchQueryProperties | SearchQuery
   */
  @Input() searchFnc = (term = ''): SearchQueryProperties | SearchQuery => ({ ...this.queryJson, term: `*${term}*` });

  /**
   * Function to map SearchResult to ReferenceItem
   */
  @Input() referenceItemFnc = (i: any) => {
    return {
      id: i?.fields.get(BaseObjectTypeField.OBJECT_ID),
      objectTypeId: i?.fields.get(BaseObjectTypeField.OBJECT_TYPE_ID),
      leadingObjectTypeId: i?.fields.get(BaseObjectTypeField.LEADING_OBJECT_TYPE_ID),
      // title and description may not be present
      title: i?.fields.get(this.objectTypeBaseProperties.title) || i.fields.get(BaseObjectTypeField.OBJECT_ID),
      description: i?.fields.get(this.objectTypeBaseProperties.description) || '',
      data: i?.fields || new Map()
    };
  };

  /**
   * Emitted once an object has been selected
   */
  @Output() objectSelect = new EventEmitter<ReferenceEntry[]>();

  get queryJson(): SearchQueryProperties {
    return {
      ...this.systemService.resolveTypesLots(this.allowedTargetTypes),
      fields: [
        BaseObjectTypeField.OBJECT_ID,
        BaseObjectTypeField.OBJECT_TYPE_ID,
        BaseObjectTypeField.LEADING_OBJECT_TYPE_ID,
        this.objectTypeBaseProperties.title,
        this.objectTypeBaseProperties.description,
        ...this.objectTypeFields
      ],
      filters: this.filters,
      size: this.maxSuggestions
    };
  }

  constructor(
    private iconRegistry: IconRegistryService,
    private systemService: SystemService,
    private searchService: SearchService,
    @Inject(ROUTES) public routes: YuvRoutes
  ) {
    this.iconRegistry.registerIcons([reference]);
    this.path = this.routes && this.routes.object ? this.routes.object.path : null;
  }
  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    if (value) {
      this.value = value;
      this.resolveFn(value);
      this._inputDisabled = !this.multiselect && this.value.length >= 1;
    } else {
      this.value = null;
      this.innerValue = [];
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  private propagate() {
    this._inputDisabled = !this.multiselect && this.innerValue.length === 1;
    this.propagateChange(this.value);
    this.objectSelect.emit(this.innerValue);
  }

  private resolveFn(value: any) {
    const ids: string[] = !value || value instanceof Array ? value || [] : [value];
    const resolveIds = ids.filter((id) => !this.innerValue?.find((v) => v.id === id));

    return this.resolveRefEntries(resolveIds)
      .pipe(map((res) => res.concat(this.innerValue || [])))
      .subscribe((items) => {
        this.innerValue = ids.map((id) => items.find((v) => v.id === id));
        setTimeout(() => this.autoCompleteInput.cd.markForCheck());
      });
  }

  private resolveRefEntries(ids: string[]): Observable<ReferenceEntry[]> {
    if (!ids?.length) return of([]);
    const { fields } = this.searchFnc();
    const q = new SearchQuery({ fields });
    q.addFilter(new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.IN, ids));
    return this.searchService.search(q).pipe(
      map((res: SearchResult) => {
        // some of the IDs could not be retrieved (no permission or deleted)
        const x = Utils.arrayToObject(res.items, (o) => o.fields.get(BaseObjectTypeField.OBJECT_ID));
        return ids.map((id) =>
          this.referenceItemFnc(
            x[id] || {
              fields: new Map(Object.entries({ [BaseObjectTypeField.OBJECT_ID]: id, [this.systemService.getBaseProperties().title]: this.noAccessTitle }))
            }
          )
        );
      })
    );
  }

  autocompleteFn(evt) {
    if (evt.query.length >= this.minLength) {
      const q = this.searchFnc(evt.query);
      this.searchService
        .search(q instanceof SearchQuery ? q : new SearchQuery(q))
        .pipe(map((reference) => reference.items.map((i) => this.referenceItemFnc(i))))
        .subscribe(
          (reference) => {
            this.autocompleteRes = reference.filter((ref) => !this.innerValue.some((value) => value.id === ref.id));
            this.propagateValidity(this.autocompleteRes.length > 0);
          },
          (e) => {
            this.autocompleteRes = [];
            this.propagateValidity(this.autocompleteRes.length > 0);
          }
        );
    } else {
      this.autocompleteRes = [];
    }
  }

  // returns null when valid else the validation object
  public validate(c: UntypedFormControl) {
    return this.isValidInput ? null : { empty: { valid: false } };
  }

  propagateValidity(valid = true) {
    if (this.isValidInput !== valid) {
      this.isValidInput = valid;
      this.propagate();
    }
  }

  // handle selection changes to the model
  onSelect(value) {
    if (this.multiselect) {
      this.value = this.innerValue.map((v) => v.id);
    } else {
      // internal autocomplete control is always set to multiselect
      // so the resolved value is always an array
      this.value = this.innerValue[0].id;
    }
    this.propagate();
  }

  // handle selection changes to the model
  onUnselect(value) {
    this.innerValue = this.innerValue.filter((v) => v.id !== value.id);
    let _value = this.innerValue.map((v) => v.id);
    this.value = this.multiselect ? _value : null;
    if (!this.multiselect) {
      this.clearInnerInput();
    }
    this.propagate();
  }

  onAutoCompleteBlur() {
    this.clearInnerInput();
  }

  private clearInnerInput() {
    if (this.autoCompleteInput.multiInputEL) {
      this.autoCompleteInput.multiInputEL.nativeElement.value = '';
      this.propagateValidity(true);
    }
  }

  ngAfterViewInit() {
    if (this.autofocus) {
      setTimeout(() => this.autoCompleteInput.multiInputEL?.nativeElement.focus());
    }
  }
}
