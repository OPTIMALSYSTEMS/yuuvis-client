import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AggregateResult,
  BaseObjectTypeField,
  ContentStreamField,
  DeviceService,
  ObjectType,
  SearchFilter,
  SearchFilterGroup,
  SearchQuery,
  SearchService,
  SystemService,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { AutoComplete } from 'primeng/autocomplete';
import { timer } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { Selectable, SelectableGroup } from '../../grouped-select';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { NotificationService } from '../../services/notification/notification.service';
import { addCircle, arrowDown, clear, search } from '../../svg.generated';
import { QuickSearchPickerData } from './quick-search-picker/quick-search-picker.component';
import { QuickSearchService } from './quick-search.service';

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
 *
 * [Screenshot](../assets/images/yuv-quick-search.gif)
 * 
 * @example
 * <yuv-quick-search #quickSearch [query]="query" (typeAggregation)="onTypeAggregation($event)"
    (querySubmit)="onSubmit($event)"></yuv-quick-search>
 *
 */
@Component({
  selector: 'yuv-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss'],
  host: { class: 'yuv-quick-search' }
})
export class QuickSearchComponent implements OnInit, AfterViewInit {
  @ViewChild('termEl') termInput: ElementRef;
  @ViewChild('autoTermEl') autoTerm: AutoComplete;
  @ViewChild('typeSelectTrigger') typeSelectTrigger: ElementRef;
  @ViewChild('fieldSelectTrigger') fieldSelectTrigger: ElementRef;
  @ViewChild('extrasForm') extrasForm: ElementRef;
  @ViewChild('tplValuePicker') tplValuePicker: TemplateRef<any>;

  autofocus: boolean = false;
  searchForm: FormGroup;
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

  formOptions: any;
  formValid = true;

  // object types that one should not search for
  // private skipTypes = [SystemType.DOCUMENT, SystemType.FOLDER];
  private skipTypes = [];
  // fields that should not be searchable
  private skipFields = [
    // ...Object.keys(RetentionField).map(k => RetentionField[k]),
    BaseObjectTypeField.OBJECT_ID,
    // BaseObjectTypeField.CREATED_BY,
    // BaseObjectTypeField.MODIFIED_BY,
    BaseObjectTypeField.TAGS,
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

  /**
   * Enables inline mode. This is a more compact version of the component that
   * is meant to be embedded into other components.
   */
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
    // wait for debounce / form changes
    setTimeout(() => this.executeSearch(), 500);
  }

  constructor(
    private quickSearchService: QuickSearchService,
    private fb: FormBuilder,
    private popoverService: PopoverService,
    private translate: TranslateService,
    private systemService: SystemService,
    private device: DeviceService,
    private notify: NotificationService,
    private searchService: SearchService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([arrowDown, addCircle, search, clear]);
    this.autofocus = this.device.isDesktop;

    this.searchForm = this.fb.group({
      term: [''],
      searchWithinContext: [false]
    });

    this.availableObjectTypes = this.quickSearchService.availableObjectTypes;
    this.availableObjectTypeGroups = this.quickSearchService.availableObjectTypeGroups;
    this.selectedObjectTypes = [];
    this.objectTypeSelectLabel = this.translate.instant('yuv.framework.quick-search.type.all');
    this.setAvailableObjectTypesFields();

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
    // TODO : update filter suggestions
    const suggestions: any[] =
      (q.isTypes ? this.availableObjectTypes : this.availableObjectTypeFields.map((o) => ({ ...o, value: [new SearchFilter(o.id, undefined, undefined)] }))) ||
      [];
    this.autoSuggestions =
      !q.isTypes && !q.isTypeFields ? [] : suggestions.filter((t) => (t.label || '').toLowerCase().includes(q.text)).map((t) => ({ ...t }));
  }

  autocompleteSelect(selection) {
    const { term } = this.lastAutoQuery;
    this.searchQuery.term = term;
    this.searchForm.patchValue({ term: { label: term } });
    this.onPickerResult(this.lastAutoQuery.isTypes ? 'type' : 'filter', [selection]);
    this.autoSelectTimer = timer(1).subscribe((t) => (this.autoSelectTimer = null));
  }

  autoKeyDown(event: KeyboardEvent) {
    if (event.code === 'Enter' && this.autoSelectTimer) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  /**
   * Executes an aggregations query returning beside other informations the
   * estimated result of the current query.
   */
  aggregate() {
    // if (this._inline) return;
    if (this.searchQuery.term || (this.searchQuery.types && this.searchQuery.types.length) || (this.searchQuery.filters && this.searchQuery.filters.length)) {
      if (!this.settingUpQuery && this.formValid) {
        this.resultCount = null;
        this.error = false;
        this.busy = true;
        this.searchService.aggregate(this.searchQuery, [BaseObjectTypeField.OBJECT_TYPE_ID]).subscribe(
          (res: AggregateResult) => {
            this.processAggregateResult(res);
            this.busy = false;
          },
          (err) => {
            if (this._inline) {
              this.notify.error(this.translate.instant('yuv.framework.quick-search.aggregate.error'));
            } else {
              this.error = true;
            }
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
      disableSmallScreenClose: true,
      data: pickerData
    };
    this.popoverService.open(this.tplValuePicker, popoverConfig);
  }

  showObjectTypeFieldPicker() {
    const pickerData: QuickSearchPickerData = {
      type: 'filter',
      items: [
        {
          id: 'filter',
          label: this.translate.instant('yuv.framework.search.filter.custom.filters'),
          items: this.availableObjectTypeFields.map((o) => ({ ...o, value: [new SearchFilter(o.id, undefined, undefined)] }))
        }
      ],
      selected: []
    };
    const popoverConfig: PopoverConfig = {
      panelClass: 'filters',
      maxHeight: 400,
      disableSmallScreenClose: true,
      data: pickerData
    };
    this.popoverService.open(this.tplValuePicker, popoverConfig, this.fieldSelectTrigger.nativeElement);
  }

  onPickerResult(type: any, res: Selectable[], popoverRef?: PopoverRef) {
    if (type === 'type') {
      this.onObjectTypesSelected(res.map((r) => r.value) as ObjectType[]);
    } else if (type === 'filter') {
      this.onFilterSelected(res[0].value as (SearchFilter | SearchFilterGroup)[]);
    }
    this.onPickerCancel(popoverRef);
  }

  onFilterSelected(filters: (SearchFilter | SearchFilterGroup)[]) {
    this.formOptions.newFilters = [...filters];
  }

  onPickerCancel(popoverRef?: PopoverRef) {
    return popoverRef && popoverRef.close();
  }

  onControlRemoved(id: string) {}

  onFilterChanged(res: Selectable) {
    this.searchQuery.filterGroup = SearchFilterGroup.fromArray(res.value);
    this.aggregate();
  }

  private onObjectTypesSelected(types: ObjectType | ObjectType[], aggregate: boolean = true) {
    this.selectedObjectTypes = (Array.isArray(types) ? types : [types]).map((t) => t.id);
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
      ? this.systemService.getObjectTypes().filter((t) => this.selectedObjectTypes.includes(t.id))
      : this.systemService.getObjectTypes();

    selectedObjectTypes.forEach((t) => {
      if (!sharedFields) {
        sharedFields = t.fields;
      } else {
        // check for fields that are not part of the shared fields
        const fieldIDs = t.fields.map((f) => f.id);
        sharedFields = sharedFields.filter((f) => fieldIDs.includes(f.id));
      }
    });

    this.availableObjectTypeFields = sharedFields
      .filter((f) => !this.skipFields.includes(f.id))
      .map((f) => ({
        id: f.id,
        label: this.systemService.getLocalizedResource(`${f.id}_label`),
        value: f
      }))
      .sort(Utils.sortValues('label'));

    this.formOptions = { filter: { id: 'new', value: [this.searchQuery.filterGroup] }, availableObjectTypeFields: this.availableObjectTypeFields };
  }

  setQuery(q: SearchQuery) {
    if (q && JSON.stringify(q) !== JSON.stringify(this.searchQuery)) {
      this.settingUpQuery = true;
      // inline mode does not use aggregations
      if (this._inline) {
        q.aggs = [];
      }
      this.resetObjectTypes();

      this.searchQuery = q;
      this.searchForm.patchValue({ term: { label: q.term } }, { emitEvent: false });

      // setup target object types
      if (q.types && q.types.length) {
        this.onObjectTypesSelected(
          this.availableObjectTypes.filter((t) => q.types.includes(t.id)).map((t) => t.value as ObjectType),
          false
        );
      }
      if (this.context && this.searchWithinContext) {
        // TODO: check all combinations
        this.searchQuery.addFilter(new SearchFilter(BaseObjectTypeField.PARENT_ID, SearchFilter.OPERATOR.EQUAL, this.context));
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
          .map((r) => {
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

  applyTypeAggration(agg: ObjectTypeAggregation, execute: boolean) {
    this.searchQuery.types = [agg.objectTypeId];
    if (execute) {
      this.executeSearch();
    }
  }

  /**
   * Reset the whole search form
   */
  reset() {
    this.searchQuery = new SearchQuery();
    this.resultCount = null;
    this.formValid = true;
    this.resetObjectTypes();
    this.searchForm.patchValue({ term: null }, { emitEvent: false });
  }

  private resetObjectTypes() {
    this.onObjectTypesSelected([]);
  }

  focusInput() {
    return this.autoTerm && this.autoTerm.inputEL.nativeElement.focus();
  }

  ngAfterViewInit() {
    if (this.autofocus) {
      this.focusInput();
    }
  }

  ngOnInit() {}
}

/**
 * Interface providing a `QuickSearchComponent`
 */
export interface ObjectTypeAggregation {
  /**
   * id of a found object type
   */
  objectTypeId: string;
  /**
   * label of an object
   */
  label: string;
  /**
   * number of objects found
   */
  count: number;
}
