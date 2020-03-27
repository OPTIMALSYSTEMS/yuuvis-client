import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IconRegistryService } from '@yuuvis/common-ui';
import {
  AggregateResult,
  BaseObjectTypeField,
  ContentStreamField,
  DeviceService,
  ObjectType,
  ObjectTypeField,
  ObjectTypeGroup,
  RangeValue,
  SearchFilter,
  SearchQuery,
  SearchService,
  SystemService,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { AutoComplete } from 'primeng/autocomplete';
import { Subscription, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Selectable, SelectableGroup } from '../../grouped-select';
import { ObjectFormControlWrapper } from '../../object-form';
import { ObjectFormControl } from '../../object-form/object-form.model';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { addCircle, arrowDown, clear, search } from '../../svg.generated';
import { ObjectFormUtils } from './../../object-form/object-form.utils';
import { QuickSearchPickerData } from './quick-search-picker/quick-search-picker.component';

/**
 * Component providing an extensible search input. It's a simple input field for fulltext
 * search queries that can be extended by searching for certain object types and even set
 * search terms for particular fields of the target types.
 *
 * Setting up the ID of a context folder will restrict the search to only return results from
 * within the given context folder.
 *
 * Adding a class of `inline` to the component will apply a different layout more suitable
 * for embedding the component somwhere else.
 */
@Component({
  selector: 'yuv-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss'],
  host: { class: 'yuv-quick-search' }
})
export class QuickSearchComponent implements OnInit, AfterViewInit {
  @ViewChild('termEl', { static: false }) termInput: ElementRef;
  @ViewChild('autoTermEl', { static: false }) autoTerm: AutoComplete;
  @ViewChild('typeSelectTrigger', { static: false }) typeSelectTrigger: ElementRef;
  @ViewChild('fieldSelectTrigger', { static: false }) fieldSelectTrigger: ElementRef;
  @ViewChild('extrasForm', { static: false }) extrasForm: ElementRef;
  @ViewChild('tplValuePicker', { static: false }) tplValuePicker: TemplateRef<any>;

  autofocus: boolean = false;
  searchForm: FormGroup;
  searchFieldsForm: FormGroup;
  searchFieldsFormSubscription: Subscription;
  invalidTerm: boolean;
  error: boolean;
  resultCount: number = null;
  searchHasResults: boolean = true;
  settingUpQuery: boolean;
  searchWithinContext: boolean = true;
  searchQuery: SearchQuery = new SearchQuery();
  autoSuggestions = [];
  autoSelectTimer: any;

  objectTypeSelectLabel: string;

  availableObjectTypes: Selectable[] = [];
  availableObjectTypeGroups: SelectableGroup[] = [];
  availableObjectTypeFields: Selectable[] = [];

  private TYPES = '@';
  private TYPE_FIELDS = '#';
  private _context: string;
  // persist former search while switching between regular and context search
  private _tmpSearch: any;
  lastAutoQuery: any = {};

  selectedObjectTypes: string[] = [];

  // list of form element IDs
  formFields: string[] = [];

  // object types that one should not search for
  // private skipTypes = [SystemType.DOCUMENT, SystemType.FOLDER];
  private skipTypes = [];
  // fields that should not be searchable
  private skipFields = [
    // ...Object.keys(RetentionField).map(k => RetentionField[k]),
    BaseObjectTypeField.OBJECT_ID,
    BaseObjectTypeField.CREATED_BY,
    BaseObjectTypeField.MODIFIED_BY,
    BaseObjectTypeField.OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_ID,
    BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_VERSION_NUMBER,
    BaseObjectTypeField.TENANT,
    BaseObjectTypeField.TRACE_ID,
    BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS,
    BaseObjectTypeField.BASE_TYPE_ID,
    ContentStreamField.ID,
    ContentStreamField.RANGE,
    ContentStreamField.REPOSITORY_ID,
    ContentStreamField.DIGEST,
    ContentStreamField.ARCHIVE_PATH
  ];

  /**
   * ID of a context folder to restrict search to.
   */
  @Input() set context(c: string) {
    if (c && c !== this.context) {
      this._context = c;
      this._tmpSearch = this.searchQuery ? this.searchQuery.toQueryJson() : null;
      // enable context search
      const contextSearch = new SearchQuery();
      contextSearch.addFilter(new SearchFilter(BaseObjectTypeField.PARENT_ID, SearchFilter.OPERATOR.EQUAL, this.context));
      this.setQuery(contextSearch);
    } else if (!c && this._tmpSearch) {
      this.setQuery(new SearchQuery(this._tmpSearch));
    }
  }
  get context() {
    return this._context;
  }

  @Input() set inline(i: boolean) {
    this._inline = i;
  }

  /**
   * A SearchQuery to be loaded. If not provided a new query will be created.
   */
  @Input() set query(q: SearchQuery) {
    if (q) {
      if (this.context && this.searchWithinContext) {
        // if context has been already set query goes to tmp
        this._tmpSearch = q.toQueryJson();
      } else {
        this.setQuery(q);
      }
    }
  }

  /**
   * Emits the query generated by the component once it is sumbitted
   */
  @Output() querySubmit = new EventEmitter<SearchQuery>();
  @Output() typeAggregation = new EventEmitter<ObjectTypeAggregation[]>();

  @HostBinding('class.busy') busy: boolean;
  @HostBinding('class.inline') _inline: boolean;

  @HostListener('keydown.enter', ['$event']) onEnter(event) {
    this.executeSearch();
  }

  constructor(
    private fb: FormBuilder,
    private popoverService: PopoverService,
    private translate: TranslateService,
    private systemService: SystemService,
    private device: DeviceService,
    private searchService: SearchService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([arrowDown, addCircle, search, clear]);
    this.autofocus = this.device.isDesktop;

    this.searchForm = this.fb.group({
      term: [''],
      searchWithinContext: [false]
    });

    this.systemService.system$.subscribe(_ => {
      const types = this.systemService
        .getObjectTypes()
        .filter(t => !this.skipTypes.includes(t.id))
        .map(ot => ({
          id: ot.id,
          label: this.systemService.getLocalizedResource(`${ot.id}_label`),
          value: ot
        }))
        .sort(Utils.sortValues('label'));
      this.availableObjectTypes = types;
      let i = 0;
      this.availableObjectTypeGroups = this.systemService.getGroupedObjectTypes().map((otg: ObjectTypeGroup) => ({
        id: `${i++}`,
        label: otg.label,
        items: otg.types.map((ot: ObjectType) => ({
          id: ot.id,
          label: this.systemService.getLocalizedResource(`${ot.id}_label`),
          highlight: ot.isFolder,
          svg: this.systemService.getObjectTypeIcon(ot.id),
          value: ot
        }))
      }));
      // this.onObjectTypesSelected([], false);
      this.selectedObjectTypes = [];
      this.objectTypeSelectLabel = this.translate.instant('yuv.framework.quick-search.type.all');
      this.setAvailableObjectTypesFields();
    });

    this.searchForm.valueChanges.pipe(distinctUntilChanged(), debounceTime(500)).subscribe(({ term }) => {
      const _term = typeof term === 'string' ? term : (term && term.label) || '';
      if (this.searchQuery.term !== _term) {
        this.searchQuery.term = _term;
        this.aggregate();
      }
    });
  }

  private parseQuery(query: string): any {
    const q = (query || '').toLowerCase();
    const match = q.match(new RegExp(`(.*)(${this.TYPE_FIELDS}|${this.TYPES})([a-zA-Z0-9\- ]*)$`)) || [];
    return { term: match[1], text: match[3], symbol: match[2], isTypeFields: match[2] === this.TYPE_FIELDS, isTypes: match[2] === this.TYPES };
  }

  autocomplete(event: any) {
    const q = (this.lastAutoQuery = this.parseQuery(event.query));
    if (q.isTypeFields) {
      this.setAvailableObjectTypesFields();
    }
    const suggestions: any[] = (q.isTypes ? this.availableObjectTypes : this.availableObjectTypeFields) || [];
    this.autoSuggestions = !q.isTypes && !q.isTypeFields ? [] : suggestions.filter(t => (t.label || '').toLowerCase().includes(q.text)).map(t => ({ ...t }));
  }

  autocompleteSelect(selection) {
    const { term } = this.lastAutoQuery;
    this.searchQuery.term = term;
    this.searchForm.patchValue({ term: { label: term } });
    this.onPickerResult(this.lastAutoQuery.isTypes ? 'type' : 'field', selection.value);
    this.autoSelectTimer = timer(1).subscribe(t => (this.autoSelectTimer = null));
  }

  autoKeyDown(event: KeyboardEvent) {
    if (event.code === 'Enter' && this.autoSelectTimer) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  private initSearchFieldsForm() {
    // object type field form (form holding the query fields)
    this.searchFieldsForm = this.fb.group({});
    this.searchFieldsFormSubscription = this.searchFieldsForm.valueChanges.pipe(debounceTime(500)).subscribe(formValue => {
      this.onSearchFieldFormChange(formValue);
    });
  }

  private onSearchFieldFormChange(formValue) {
    // generate search query filter section from form fields

    // extract form controls
    const formControls: ObjectFormControl[] = [];
    Object.keys(this.searchFieldsForm.controls).forEach(k => {
      const wrapper: ObjectFormControlWrapper = this.searchFieldsForm.controls[k] as ObjectFormControlWrapper;
      formControls.push(wrapper.controls[wrapper._eoFormControlWrapper.controlName] as ObjectFormControl);
    });

    // get comparator for current filter settings (avoiding unnecessary aggregate calls)
    const filterCompareCurrent = this.getFilterComparator(this.searchQuery.filters);

    // setup filters from form controls
    this.searchQuery.clearFilters();
    formControls.forEach(fc => {
      const filter = new SearchFilter(fc._eoFormElement.name, SearchFilter.OPERATOR.EQUAL, fc.value);
      if (!filter.isEmpty() || fc._eoFormElement.isNotSetValue) {
        this.searchQuery.addFilter(filter);
      }
    });
    const filterCompareNew = this.getFilterComparator(this.searchQuery.filters);
    // only execute aggregate call if filter settings have actually been changed
    if (filterCompareCurrent !== filterCompareNew) {
      this.aggregate();
    }
  }

  /**
   * Generates an object from a filters array and returns its JSON string (stringified).
   * Used for checking equality of filter arrays.
   * @param filters
   */
  private getFilterComparator(filters: SearchFilter[]): string {
    return filters
      .map(f => f.toString())
      .sort()
      .join();
  }

  /**
   * Executes an aggregations query returning beside other informations the
   * estimated result of the current query.
   */
  aggregate() {
    // if (this._inline) return;
    if (this.searchQuery.term || (this.searchQuery.types && this.searchQuery.types.length) || (this.searchQuery.filters && this.searchQuery.filters.length)) {
      if (!this.settingUpQuery && this.searchForm.valid && (!this.searchFieldsForm || this.searchFieldsForm.valid)) {
        this.resultCount = null;
        this.error = false;
        this.busy = true;
        this.searchService.aggregate(this.searchQuery, [BaseObjectTypeField.OBJECT_TYPE_ID]).subscribe(
          (res: AggregateResult) => {
            this.processAggregateResult(res);
            this.busy = false;
          },
          err => {
            this.error = true;
            this.busy = false;
            this.typeAggregation.emit([]);
          }
        );
      }
    } else {
      this.typeAggregation.emit([]);
    }
  }

  showObjectTypePicker() {
    const pickerData: QuickSearchPickerData = {
      type: 'type',
      items: this.availableObjectTypeGroups,
      selected: this.selectedObjectTypes
    };
    const popoverConfig: PopoverConfig = {
      width: '55%',
      height: '70%',
      data: pickerData
    };
    this.popoverService.open(this.tplValuePicker, popoverConfig);
  }

  showObjectTypeFieldPicker() {
    const pickerData: QuickSearchPickerData = {
      type: 'field',
      items: [
        {
          id: 'field',
          items: this.availableObjectTypeFields
        }
      ],
      selected: []
    };
    const popoverConfig: PopoverConfig = {
      panelClass: 'fields',
      maxHeight: 200,
      data: pickerData
    };
    this.popoverService.open(this.tplValuePicker, popoverConfig, this.fieldSelectTrigger.nativeElement);
  }

  onPickerResult(type: 'type' | 'field', res: ObjectType[] | ObjectTypeField, popoverRef?: PopoverRef) {
    switch (type) {
      case 'field': {
        this.onObjectTypeFieldSelected(res as ObjectTypeField);
        break;
      }
      case 'type': {
        this.onObjectTypesSelected(res as ObjectType[]);
        break;
      }
    }
    if (popoverRef) {
      popoverRef.close();
    }
  }

  onPickerCancel(popoverRef?: PopoverRef) {
    if (popoverRef) {
      popoverRef.close();
    }
  }

  private onObjectTypeFieldSelected(field: ObjectTypeField, isEmpty = false) {
    this.addFieldEntry(field, isEmpty);
  }

  private onObjectTypesSelected(types: ObjectType | ObjectType[], aggregate: boolean = true) {
    this.selectedObjectTypes = (Array.isArray(types) ? types : [types]).map(t => t.id);
    this.setAvailableObjectTypesFields();

    // get rid of existing object type fields that not match availableObjectTypeFields
    this.formFields.filter(id => !this.availableObjectTypeFields.find(field => `fc_${field.id}` === id)).forEach(f => this.removeFieldEntry(f));

    if (this.selectedObjectTypes.length === 1) {
      this.objectTypeSelectLabel = this.systemService.getLocalizedResource(`${this.selectedObjectTypes[0]}_label`);
    } else if (this.selectedObjectTypes.length === this.availableObjectTypes.length || this.selectedObjectTypes.length === 0) {
      this.objectTypeSelectLabel = this.translate.instant('yuv.framework.quick-search.type.all');
    } else {
      this.objectTypeSelectLabel = this.translate.instant('yuv.framework.quick-search.type.multiple', { size: this.selectedObjectTypes.length });
    }
    this.searchQuery.types = this.selectedObjectTypes;
    if (aggregate) {
      this.aggregate();
    }
    this.focusInput();
  }

  private setAvailableObjectTypesFields() {
    this.availableObjectTypeFields = [];

    let sharedFields;

    const selectedObjectTypes: ObjectType[] = this.selectedObjectTypes.length
      ? this.systemService.getObjectTypes().filter(t => this.selectedObjectTypes.includes(t.id))
      : this.systemService.getObjectTypes();

    selectedObjectTypes.forEach(t => {
      if (!sharedFields) {
        sharedFields = t.fields;
      } else {
        // check for fields that are not part of the shared fields
        const fieldIDs = t.fields.map(f => f.id);
        sharedFields = sharedFields.filter(f => fieldIDs.includes(f.id));
      }
    });

    this.availableObjectTypeFields = sharedFields
      .filter(f => !this.skipFields.includes(f.id))
      .map(f => ({
        id: f.id,
        label: this.systemService.getLocalizedResource(`${f.id}_label`),
        value: f
      }))
      .sort(Utils.sortValues('label'));
  }

  setQuery(q: SearchQuery) {
    if (q && JSON.stringify(q) !== JSON.stringify(this.searchQuery)) {
      this.settingUpQuery = true;
      // inline mode does not use aggregations
      if (this._inline) {
        q.aggs = [];
      }
      this.resetObjectTypes();
      this.resetObjectTypeFields();

      this.searchQuery = q;
      this.searchForm.patchValue({ term: { label: q.term } }, { emitEvent: false });

      // setup target object types
      if (q.types && q.types.length) {
        this.onObjectTypesSelected(
          this.availableObjectTypes.filter(t => q.types.includes(t.id)).map(t => t.value as ObjectType),
          false
        );
      }
      if (this.context && this.searchWithinContext) {
        this.searchQuery.addFilter(new SearchFilter(BaseObjectTypeField.PARENT_ID, SearchFilter.OPERATOR.EQUAL, this.context));
      }
      // setup object type field form from filters
      if (q.filters && q.filters.length) {
        const filterIDs = [];
        const filters: any = {};
        const formPatch = {};

        q.filters.forEach(f => {
          filterIDs.push(f.property);
          filters[f.property] = f;
        });

        this.availableObjectTypeFields
          .filter(otf => filterIDs.includes(otf.id))
          .forEach(otf => {
            const field = otf.value as ObjectTypeField;
            this.onObjectTypeFieldSelected(field, filters[otf.id].isEmpty());
            // setup values based on whether or not the type supports ranges
            const isRange = ['datetime', 'integer', 'decimal'].includes(field.propertyType);
            const cv = {};
            cv[otf.id] = !isRange
              ? filters[otf.id].firstValue
              : new RangeValue(filters[otf.id].operator, filters[otf.id].firstValue, filters[otf.id].secondValue);
            formPatch[`fc_${otf.id}`] = cv;
          });
        if (this.searchFieldsForm) {
          this.searchFieldsForm.patchValue(formPatch);
        }
      }
      this.settingUpQuery = false;
      this.aggregate();
    }
  }

  executeSearch() {
    this.searchQuery.aggs = null;
    this.querySubmit.emit(this.searchQuery);
  }

  private processAggregateResult(res: AggregateResult) {
    this.resultCount = 0;
    if (res.aggregations && res.aggregations.length) {
      this.searchHasResults = true;
      // type aggregations
      this.typeAggregation.emit(
        res.aggregations[0].entries
          .map(r => {
            this.resultCount += r.count;
            return { objectTypeId: r.key, label: this.systemService.getLocalizedResource(`${r.key}_label`), count: r.count };
          })
          .sort(Utils.sortValues('label'))
      );
    } else {
      this.searchHasResults = false;
    }
  }

  toggleSearchWithinContext() {
    this.searchWithinContext = !this.searchWithinContext;
    const s = { ...this.searchQuery.toQueryJson() };
    this.setQuery(new SearchQuery({ ...this._tmpSearch }));
    this._tmpSearch = s;
  }

  /**
   * Adds a new form field to the query
   * @param field The object type field to be added
   */
  addFieldEntry(field: ObjectTypeField, isEmpty = false) {
    if (!this.searchFieldsForm) {
      this.initSearchFieldsForm();
    }
    const formElement = this.systemService.toFormElement(field);
    // required fields make no sense for search
    formElement.required = false;
    // disable descriptions as well in order to keep the UI clean
    formElement.description = null;
    formElement.isNotSetValue = isEmpty;

    const formControl = ObjectFormUtils.elementToFormControl(formElement, 'SEARCH');
    this.searchFieldsForm.addControl(`fc_${field.id}`, formControl);
    this.formFields.push(`fc_${field.id}`);

    // focus the generated field
    setTimeout(() => {
      this.focusLastExtrasField();
    }, 500);
  }

  applyTypeAggration(agg: ObjectTypeAggregation, execute: boolean) {
    this.searchQuery.types = [agg.objectTypeId];
    if (execute) {
      this.executeSearch();
    }
  }

  private focusLastExtrasField() {
    const focusables = this.extrasForm.nativeElement.querySelectorAll('input, textarea');
    if (focusables.length) {
      focusables[focusables.length - 1].focus();
    }
  }

  /**
   * Remove a form element from the query form
   * @param formElement The form element to be removed
   */
  removeFieldEntry(formControlName: string) {
    this.formFields = this.formFields.filter(f => f !== formControlName);
    this.searchFieldsForm.removeControl(formControlName);
  }

  /**
   * Reset the whole search form
   */
  reset() {
    this.searchQuery = new SearchQuery();
    this.resultCount = null;
    this.resetObjectTypes();
    this.resetObjectTypeFields();
    this.searchForm.patchValue({ term: null }, { emitEvent: false });
  }

  private resetObjectTypeFields() {
    this.formFields = [];
    this.searchFieldsForm = null;
    if (this.searchFieldsFormSubscription) {
      this.searchFieldsFormSubscription.unsubscribe();
    }
    this.searchQuery.clearFilters();
  }
  private resetObjectTypes() {
    this.onObjectTypesSelected([]);
  }

  focusInput() {
    if (this.autoTerm) {
      this.autoTerm.inputEL.nativeElement.focus();
    }
  }

  ngAfterViewInit() {
    if (this.autofocus) {
      this.focusInput();
    }
  }

  ngOnInit() {}
}

export interface ObjectTypeAggregation {
  objectTypeId: string;
  label: string;
  count: number;
}
