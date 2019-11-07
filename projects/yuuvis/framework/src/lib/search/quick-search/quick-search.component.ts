import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AggregateResult,
  BaseObjectTypeField,
  ContentStreamField,
  ObjectType,
  ObjectTypeField,
  RangeValue,
  RetentionField,
  SearchFilter,
  SearchQuery,
  SearchService,
  SystemService,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { AutoComplete } from 'primeng/autocomplete';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ObjectFormControlWrapper } from '../../object-form';
import { ObjectFormControl } from '../../object-form/object-form.model';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { SVGIcons } from '../../svg.generated';
import { ObjectFormUtils } from './../../object-form/object-form.utils';
import { ValuePickerItem } from './value-picker/value-picker.component';

/**
 * Component providing an extensible search input. It's a simple input field for fulltext
 * search queries that can be extended by searching for certain object types and even set
 * search terms for particular fields of the target types.
 */
@Component({
  selector: 'yuv-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss'],
  host: { class: 'yuv-quick-search' }
})
export class QuickSearchComponent implements AfterViewInit {
  @ViewChild('termEl', { static: false }) termInput: ElementRef;
  @ViewChild('autoTermEl', { static: false }) autoTerm: AutoComplete;
  @ViewChild('typeSelectTrigger', { static: false }) typeSelectTrigger: ElementRef;
  @ViewChild('fieldSelectTrigger', { static: false }) fieldSelectTrigger: ElementRef;
  @ViewChild('extrasForm', { static: false }) extrasForm: ElementRef;
  @ViewChild('tplValuePicker', { static: false }) tplValuePicker: TemplateRef<any>;

  icons = {
    search: SVGIcons['search'],
    clear: SVGIcons['clear'],
    arrowDown: SVGIcons['arrow-down'],
    addCircle: SVGIcons['addCircle']
  };
  searchForm: FormGroup;
  searchFieldsForm: FormGroup;
  invalidTerm: boolean;
  error: boolean;
  resultCount: number = null;
  searchHasResults: boolean = true;
  settingUpQuery: boolean;
  searchQuery: SearchQuery;
  autoSuggestions = [];

  objectTypeSelectLabel: string;

  availableObjectTypes: { id: string; label: string; value: string }[];
  availableObjectTypeFields: { id: string; label: string; value: ObjectTypeField }[];

  selectedObjectTypes: string[];

  // list of form element IDs
  formFields: string[] = [];

  // object types that one should not search for
  // private skipTypes = [SystemType.DOCUMENT, SystemType.FOLDER];
  private skipTypes = [];
  // fields that should not be searchable
  private skipFields = [
    ...Object.keys(RetentionField).map(k => RetentionField[k]),
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
   * A SearchQuery to be loaded. If not provided a new query will be created.
   */
  @Input() set query(q: SearchQuery) {
    if (q) {
      this.setQuery(q);
    }
  }

  /**
   * Emits the query generated by the component once it is sumbitted
   */
  @Output() querySubmit = new EventEmitter<SearchQuery>();

  @HostBinding('class.busy') busy: boolean;
  @HostListener('keydown.alt.+', ['$event']) onAddField(event) {
    if (this.availableObjectTypeFields.length) {
      this.showObjectTypeFieldPicker();
    }
  }

  @HostListener('keydown.alt.-', ['$event']) onAddType(event) {
    if (this.availableObjectTypes.length) {
      this.showObjectTypePicker();
    }
  }

  @HostListener('keydown.enter', ['$event']) onEnter(event) {
    // if (!this.searchFieldsForm) {
    this.executeSearch();
    // }
  }

  constructor(
    private fb: FormBuilder,
    private popoverService: PopoverService,
    private translate: TranslateService,
    private systemService: SystemService,
    private searchService: SearchService
  ) {
    this.searchQuery = new SearchQuery();
    this.searchForm = this.fb.group({
      term: ['']
    });

    this.searchForm.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(500)
      )
      .subscribe(formValue => {
        this.searchQuery.term = formValue.term;
        this.aggregate();
      });

    this.systemService.system$.subscribe(_ => {
      const types = this.systemService
        .getObjectTypes()
        .filter(t => !this.skipTypes.includes(t.id))
        .map(ot => ({
          id: ot.id,
          label: this.systemService.getLocalizedResource(`${ot.id}_label`),
          value: ot.id
        }))
        .sort(Utils.sortValues('label'));
      this.availableObjectTypes = types;
      this.onObjectTypesSelected([], false);
    });
  }

  autocomplete(event) {
    const q = event.query.toLowerCase();
    if (q === '#') {
      this.setAvailableObjectTypesFields();
    }
    const suggestions: any[] = (q.startsWith('@') ? this.availableObjectTypes : this.availableObjectTypeFields) || [];
    this.autoSuggestions = !q.match(/^@|^#/)
      ? []
      : suggestions.filter(t => t.label.toLowerCase().includes(q.slice(1))).map(t => ({ ...t, autoLabel: q.slice(0, 1) + t.label }));
  }

  autocompleteSelect(selection) {
    this.searchForm.patchValue({
      term: ''
    });
    this.onValuePickerResult(selection.autoLabel.startsWith('@') ? 'type' : 'field', selection.value);
  }

  autoKeyDown(event: KeyboardEvent) {
    // TODO: find better way to handle overlay Enter event
    if (event.code === 'Enter' && !this.searchForm.get('term').value) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  private initSearchFieldsForm() {
    // object type field form (form holding the query fields)
    this.searchFieldsForm = this.fb.group({});
    this.searchFieldsForm.valueChanges.pipe(debounceTime(500)).subscribe(formValue => {
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
    if (!this.settingUpQuery && this.searchForm.valid && (!this.searchFieldsForm || this.searchFieldsForm.valid)) {
      this.resultCount = null;
      this.error = false;
      this.busy = true;
      this.searchService.aggregate(this.searchQuery).subscribe(
        (res: AggregateResult) => {
          this.processAggregateResult(res);
          this.busy = false;
        },
        err => {
          this.error = true;
          this.busy = false;
        }
      );
    }
  }

  showObjectTypePicker() {
    this.showValuePicker(this.tplValuePicker, this.typeSelectTrigger.nativeElement, this.availableObjectTypes, 'type');
  }

  showObjectTypeFieldPicker() {
    this.showValuePicker(this.tplValuePicker, this.fieldSelectTrigger.nativeElement, this.availableObjectTypeFields, 'field');
  }

  private showValuePicker(template: TemplateRef<any>, target: HTMLElement, items: ValuePickerItem[], type: 'type' | 'field'): void {
    this.popoverService.open(template, target, {
      data: {
        type: type,
        items: items,
        selected: type === 'type' ? this.selectedObjectTypes : null,
        multiselect: type === 'type'
      }
    });
  }

  onValuePickerResult(type: 'type' | 'field', res: any, popoverRef?: PopoverRef) {
    switch (type) {
      case 'field': {
        this.onObjectTypeFieldSelected(res);
        break;
      }
      case 'type': {
        this.onObjectTypesSelected(res);
        break;
      }
    }
    if (popoverRef) {
      popoverRef.close();
    }
  }

  private onObjectTypeFieldSelected(field: ObjectTypeField, isEmpty = false) {
    this.addFieldEntry(field, isEmpty);
  }

  private onObjectTypesSelected(types: string | string[], aggregate: boolean = true) {
    // get rid of existing object type field form
    this.resetObjectTypeFields();
    this.selectedObjectTypes = typeof types === 'string' ? [types] : types;
    this.setAvailableObjectTypesFields();

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
      this.resetObjectTypes();
      this.resetObjectTypeFields();
      this.searchForm.patchValue(
        {
          term: q.term
        },
        { emitEvent: false }
      );

      // setup target object types
      if (q.types && q.types.length) {
        this.onObjectTypesSelected(q.types, false);
      }
      this.searchQuery = q;
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
            this.onObjectTypeFieldSelected(otf.value, filters[otf.id].isEmpty());
            // setup values based on whether or not the type supports ranges
            const isRange = ['datetime', 'integer', 'decimal'].includes(otf.value.propertyType);
            const cv = {};
            cv[otf.id] = !isRange
              ? filters[otf.id].firstValue
              : new RangeValue(filters[otf.id].operator, filters[otf.id].firstValue, filters[otf.id].secondValue);
            formPatch[`fc_${otf.id}`] = cv;
          });
        this.searchFieldsForm.patchValue(formPatch);
      }
      this.settingUpQuery = false;
      this.aggregate();
    }
  }

  executeSearch() {
    this.querySubmit.emit(this.searchQuery);
  }

  private processAggregateResult(res: AggregateResult) {
    this.resultCount = res.totalNumItems;
    if (res.aggregations && res.aggregations.length) {
      this.searchHasResults = true;
    } else {
      this.searchHasResults = false;
    }
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
    this.searchForm.patchValue({
      term: ''
    });
  }

  private resetObjectTypeFields() {
    this.formFields = [];
    this.searchFieldsForm = null;
    this.searchQuery.clearFilters();
  }
  private resetObjectTypes() {
    this.onObjectTypesSelected([]);
  }

  focusInput() {
    if (this.autoTerm) {
      // this.termInput.nativeElement.focus();
      this.autoTerm.inputEL.nativeElement.focus();
    }
  }

  ngAfterViewInit() {
    this.focusInput();
  }
}

interface ObjectTypeAggregation {
  objectTypeId: string;
  label: string;
  count: number;
}
