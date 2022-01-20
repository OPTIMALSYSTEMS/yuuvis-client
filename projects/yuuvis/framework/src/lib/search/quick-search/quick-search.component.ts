import {
  AfterViewInit,
  Attribute,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AggregateResult,
  BaseObjectTypeField,
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
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { Selectable, SelectableGroup } from '../../grouped-select';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { NotificationService } from '../../services/notification/notification.service';
import { arrowDown, clear, filter, reset, search } from '../../svg.generated';
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

  get availableObjectTypes(): Selectable[] {
    return this.quickSearchService.availableObjectTypes;
  }

  get availableObjectTypeGroups(): SelectableGroup[] {
    let sg = JSON.parse(JSON.stringify(this.quickSearchService.availableObjectTypeGroups));
    if (this.skipTypes) {
      sg.forEach((g: SelectableGroup) => (g.items = g.items.filter((i) => !this.skipTypes.includes(i.id))));
      sg = sg.filter((g: SelectableGroup) => g.items?.length);
    }
    return sg;
  }

  get availableObjectTypeGroupsList(): Selectable[] {
    return this.availableObjectTypeGroups.reduce((pre, cur) => [...pre, ...cur.items], []);
  }

  availableObjectTypeFields: Selectable[] = [];

  private TYPES = '@';
  private TYPE_FIELDS = '#';
  private _context: string;
  lastAutoQuery: any = {};

  selectedObjectTypes: string[] = [];

  formOptions: any;
  formValid = true;

  /**
   * ID of a context folder to restrict search to.
   */
  @Input() set context(c: string) {
    if (c && c !== this.context) {
      this._context = c;
      // enable context search
      const contextQuery = new SearchQuery();
      contextQuery.addFilter(new SearchFilter(BaseObjectTypeField.PARENT_ID, SearchFilter.OPERATOR.EQUAL, c));
      this.setQuery(contextQuery);
    } else {
      this._context = c;
      if (this.searchQuery) {
        this.searchQuery.removeFilter(BaseObjectTypeField.PARENT_ID);
      }
    }
  }
  get context() {
    return this._context;
  }

  // list of types (object type IDs) that should not be shown in the object type picker
  @Input() skipTypes: string[];

  private get contextFilter() {
    return new SearchFilter(BaseObjectTypeField.PARENT_ID, SearchFilter.OPERATOR.EQUAL, this.context);
  }

  private get customFilters(): Selectable[] {
    return this.availableObjectTypeFields.map((o) => ({ ...o, value: [new SearchFilter(o.id, o.defaultOperator, o.defaultValue)] }));
  }

  private enabledFilters: Selectable[] = [];

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
    this.setQuery(q);
  }

  /**
   * Emits the query generated by the component once it is sumbitted
   */
  @Output() querySubmit = new EventEmitter<SearchQuery>();
  @Output() queryReset = new EventEmitter();
  @Output() queryChange = new EventEmitter<SearchQuery>();
  @Output() typeAggregation = new EventEmitter<ObjectTypeAggregation[]>();

  @HostBinding('class.busy') busy: boolean;
  @HostBinding('class.inline') _inline: boolean;

  @HostListener('keydown.enter', ['$event']) onEnter(event) {
    // wait for debounce / form changes
    setTimeout(() => this.executeSearch(), 500);
  }

  constructor(
    @Attribute('disableAggregations') private disableAggregations: string,
    @Attribute('autofocus') private af: string,
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
    this.iconRegistry.registerIcons([arrowDown, filter, search, clear, reset]);
    this.autofocus = !!af;

    this.searchForm = this.fb.group({
      term: [''],
      searchWithinContext: [false]
    });

    this.selectedObjectTypes = [];
    this.objectTypeSelectLabel = this.translate.instant('yuv.framework.quick-search.type.all');
    // TODO: load only if needed
    this.quickSearchService.loadFilterSettings().subscribe(() => this.setAvailableObjectTypesFields());

    this.searchForm.valueChanges
      .pipe(
        distinctUntilChanged(),
        map(({ term }) => this.updateSearchTerm()),
        debounceTime(1000)
      )
      .subscribe((aggregate: boolean) => {
        if (aggregate) {
          this.aggregate();
        }
      });
  }

  updateSearchTerm(): boolean {
    const value = this.searchForm.get('term')?.value;
    const term = (typeof value === 'string' ? value : value?.label) || '';
    const termUpdated = this.searchQuery.term !== term;
    if (termUpdated) {
      this.searchQuery.term = term;
    }
    return termUpdated;
  }

  private parseQuery(query: string): any {
    const q = (query || '').toLowerCase();
    const match = q.match(new RegExp(`(.*)(${this.TYPE_FIELDS}|${this.TYPES})([a-zA-Z0-9\- ]*)$`)) || [];
    return { term: match[1], text: match[3], symbol: match[2], isTypeFields: match[2] === this.TYPE_FIELDS, isTypes: match[2] === this.TYPES };
  }

  autocomplete(event: any) {
    const q = (this.lastAutoQuery = this.parseQuery(event.query));
    const allFilters = this.quickSearchService.groupFilters(this.customFilters).reduce((prev, cur) => [...prev, ...cur.items], []);
    const suggestions: any[] = (q.isTypes ? this.availableObjectTypeGroupsList : [...allFilters, ...this.enabledFilters]) || [];
    this.autoSuggestions =
      !q.isTypes && !q.isTypeFields
        ? []
        : suggestions
            .filter((t) => (t.label || '').toLowerCase().includes(q.text))
            .map((t) => ({ ...t }))
            .sort(Utils.sortValues('label'));
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
    this.queryChange.emit(this.searchQuery);
    if (!!this.disableAggregations) {
      return;
    }
    // if (this._inline) return;
    if (this.searchQuery.term || this.searchQuery.allTypes.length || (this.searchQuery.filters && this.searchQuery.filters.length)) {
      if (!this.settingUpQuery && this.formValid) {
        this.resultCount = null;
        this.error = false;
        this.busy = true;
        this.searchService.aggregate(this.searchQuery, [BaseObjectTypeField.LEADING_OBJECT_TYPE_ID]).subscribe(
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
      width: pickerData.items.length <= 1 ? 'auto' : pickerData.items.length === 2 ? `${18 * 2}%` : `${18 * 3}%`,
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
        ...this.quickSearchService.groupFilters(this.customFilters),
        {
          id: 'stored',
          label: this.translate.instant('yuv.framework.search.filter.stored.filters'),
          items: this.enabledFilters
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
    this.searchQuery.filterGroup = SearchFilterGroup.fromArray(res.value).clone();
    if (this.context && this.searchWithinContext) {
      this.searchQuery.addFilter(this.contextFilter);
    }
    this.aggregate();
  }

  private onObjectTypesSelected(types: ObjectType | ObjectType[], aggregate: boolean = true) {
    this.selectedObjectTypes = (Array.isArray(types) ? types : [types]).map((t) => t.id);
    this.setAvailableObjectTypesFields();

    if (this.selectedObjectTypes.length === 1) {
      this.objectTypeSelectLabel = this.systemService.getLocalizedResource(`${this.selectedObjectTypes[0]}_label`) || this.selectedObjectTypes[0];
    } else if (this.selectedObjectTypes.length === this.availableObjectTypeGroupsList.length || this.selectedObjectTypes.length === 0) {
      this.objectTypeSelectLabel = this.translate.instant('yuv.framework.quick-search.type.all');
    } else {
      this.objectTypeSelectLabel = this.translate.instant('yuv.framework.quick-search.type.multiple', { size: this.selectedObjectTypes.length });
    }
    this.quickSearchService.updateTypesAndLots(this.searchQuery, this.selectedObjectTypes);
    if (aggregate) {
      this.aggregate();
    }
    this.focusInput();
  }

  private setAvailableObjectTypesFields() {
    this.availableObjectTypeFields = this.quickSearchService.getAvailableObjectTypesFields(this.selectedObjectTypes);

    this.quickSearchService.getCurrentSettings().subscribe(([storedFilters, hiddenFilters]) => {
      this.enabledFilters = this.quickSearchService
        .loadFilters(storedFilters as any, this.availableObjectTypeFields)
        .filter((f) => !(hiddenFilters as any).includes(f.id));
    });

    // properties that are required allthough they may not appear in the list of the availableObjectTypesFields
    const requiredFields = [BaseObjectTypeField.PARENT_ID];
    const fields = [...requiredFields, ...this.availableObjectTypeFields.map((t) => t.id)];

    // remove filters that are not relevant
    this.searchQuery.filterGroup.filters.forEach((f) => {
      if (!fields.includes(f.property)) {
        this.searchQuery.filterGroup.remove(f.id);
      }
    });
    this.formOptions = { filter: { id: 'new', value: [this.searchQuery.filterGroup.clone()] }, availableObjectTypeFields: this.availableObjectTypeFields };
  }

  setQuery(q: SearchQuery) {
    if (q && JSON.stringify(q) !== JSON.stringify(this.searchQuery)) {
      this.settingUpQuery = true;
      // inline mode does not use aggregations
      if (this._inline) {
        q.aggs = [];
      }

      this.searchQuery = q;
      this.searchForm.patchValue({ term: { label: q.term } }, { emitEvent: false });

      // setup target object types
      this.onObjectTypesSelected(
        q.allTypes.length ? this.availableObjectTypes.filter((t) => q.allTypes.includes(t.id)).map((t) => t.value as ObjectType) : [],
        false
      );

      if (this.context && this.searchWithinContext) {
        this.searchQuery.addFilter(this.contextFilter);
      }
      this.settingUpQuery = false;
    }
  }

  executeSearch() {
    this.searchQuery.aggs = null;
    const aggregate = this.updateSearchTerm();
    if (aggregate) {
      this.aggregate();
    }
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
            return { objectTypeId: r.key, label: this.systemService.getLocalizedResource(`${r.key}_label`) || r.key, count: r.count };
          })
          .sort(Utils.sortValues('label'))
      );
    } else {
      this.searchHasResults = false;
    }
  }

  toggleSearchWithinContext() {
    this.searchWithinContext = !this.searchWithinContext;
    this.searchQuery.removeFilter(BaseObjectTypeField.PARENT_ID);
    if (this.searchWithinContext) {
      this.searchQuery.addFilter(new SearchFilter(BaseObjectTypeField.PARENT_ID, SearchFilter.OPERATOR.EQUAL, this._context));
    }
    this.setQuery(this.searchQuery);
  }

  applyTypeAggration(agg: ObjectTypeAggregation, execute: boolean) {
    this.quickSearchService.updateTypesAndLots(this.searchQuery, [agg.objectTypeId], true);
    if (execute) {
      this.executeSearch();
    }
  }

  /**
   * Reset the whole search form
   */
  reset() {
    this.searchQuery = new SearchQuery();
    if (this._context) {
      this.searchQuery.addFilter(new SearchFilter(BaseObjectTypeField.PARENT_ID, SearchFilter.OPERATOR.EQUAL, this._context));
    }
    this.resultCount = null;
    this.formValid = true;
    this.onObjectTypesSelected([]);
    this.searchForm.patchValue({ term: null }, { emitEvent: false });
    this.queryReset.emit();
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
