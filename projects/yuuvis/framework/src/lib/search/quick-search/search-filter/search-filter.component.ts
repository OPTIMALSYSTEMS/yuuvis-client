import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BackendService, BaseObjectTypeField, SearchFilter, SearchQuery, SystemService, TranslateService, Utils } from '@yuuvis/core';
import { forkJoin } from 'rxjs';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { Selectable } from '../../../grouped-select';
import { SelectableGroup } from '../../../grouped-select/grouped-select/grouped-select.interface';
import { FileSizePipe } from '../../../pipes/filesize.pipe';
import { PopoverConfig } from '../../../popover/popover.interface';
import { PopoverService } from '../../../popover/popover.service';
import { favorite, reset, settings } from '../../../svg.generated';
import { QuickSearchService } from '../quick-search.service';
import { LayoutService } from './../../../services/layout/layout.service';
import { listModeDefault, listModeSimple } from './../../../svg.generated';

export type FilterViewMode = 'standard' | 'groups';

@Component({
  selector: 'yuv-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit {
  @ViewChild('tplFilterConfig') tplFilterConfig: TemplateRef<any>;

  @Input() viewMode: FilterViewMode = 'standard';

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  private _layoutOptionsKey: string;
  @Input() set layoutOptionsKey(lok: string) {
    this._layoutOptionsKey = lok;
    this.layoutService.loadLayoutOptions(this.layoutOptionsKey, 'yuv-search-filter').subscribe((o: any) => {
      this._layoutOptions = o || {};
      if (o && o.viewMode) {
        this.viewMode = o.viewMode;
      }
    });
  }

  get layoutOptionsKey() {
    return this._layoutOptionsKey + '.search-filter';
  }

  private _layoutOptions: any = {};

  availableTypeGroups: SelectableGroup[] = [];
  availableObjectTypes: Selectable[] = [];
  typeSelection: string[] = [];

  availableFilterGroups: SelectableGroup[] = [];
  availableObjectTypeFields: Selectable[] = [];

  get filterSelection() {
    return (this.activeFilters || []).map((f) => f.id);
  }

  activeFilters: Selectable[] = [];
  lastFilters: Selectable[] = [];
  storedFilters: Selectable[] = [];

  filesizePipe: FileSizePipe;
  _query: SearchQuery;
  private filterQuery: SearchQuery;
  private parentID: SearchFilter;

  @Input() set query(q: SearchQuery) {
    if (q) {
      this._query = new SearchQuery(q.toQueryJson());
      this.filterQuery = new SearchQuery(q.toQueryJson());
      this.setupFilterPanel();
    } else {
      this._query = null;
      this.filterQuery = null;
    }
  }

  @Output() filterChange = new EventEmitter<SearchQuery>();

  constructor(
    private backend: BackendService,
    private translate: TranslateService,
    private systemService: SystemService,
    private iconRegistry: IconRegistryService,
    private quickSearchService: QuickSearchService,
    private popoverService: PopoverService,
    private layoutService: LayoutService
  ) {
    this.iconRegistry.registerIcons([settings, reset, favorite, listModeDefault, listModeSimple]);
  }

  private saveLayoutOptions(options: any) {
    if (this._layoutOptionsKey) {
      this._layoutOptions = { ...this._layoutOptions, ...options };
      this.layoutService.saveLayoutOptions(this.layoutOptionsKey, 'yuv-search-filter', { ...this._layoutOptions }).subscribe();
    }
  }

  onToggle(group: SelectableGroup) {
    this.saveLayoutOptions({
      collapsedGroups: (this._layoutOptions.collapsedGroups || []).filter((id) => id !== group.id).concat(group.collapsed ? [group.id] : [])
    });
  }

  modeChange(viewMode: FilterViewMode) {
    this.viewMode = viewMode;
    this.saveLayoutOptions({ viewMode });
    this.setupFilters(this.typeSelection, this.activeFilters);
  }

  private setupFilterPanel() {
    this.parentID = this.filterQuery.filters.find((f) => f.property === BaseObjectTypeField.PARENT_ID);
    this.quickSearchService.getActiveTypes(this.filterQuery).subscribe((res: any) => this.setupTypes(res));
  }

  private setupCollapsedGroups() {
    if (this._layoutOptions && this._layoutOptions.collapsedGroups) {
      [...this.availableFilterGroups, ...this.availableTypeGroups].forEach((g) => (g.collapsed = this._layoutOptions.collapsedGroups.includes(g.id)));
    }
  }

  private setupTypes(types: Selectable[]) {
    this.typeSelection = types.map((t) => t.id);
    this.availableObjectTypes = [...types];
    this.availableTypeGroups = [
      {
        id: 'types',
        label: this.translate.instant('yuv.framework.search.filter.object.types'),
        items: types
      }
    ];
    this.setupCollapsedGroups();
    return this.setupFilters(this.typeSelection);
  }

  private setupFilters(typeSelection: string[], activeFilters?: Selectable[]) {
    this.availableObjectTypeFields = this.quickSearchService.getAvailableObjectTypesFields(typeSelection);

    forkJoin([
      this.quickSearchService.loadStoredFilters(),
      this.quickSearchService.loadFiltersVisibility(),
      this.quickSearchService.loadLastFilters()
    ]).subscribe(([storedFilters, visibleFilters, lastFilters]) => {
      this.storedFilters = this.quickSearchService.loadFilters(storedFilters as any, this.availableObjectTypeFields);
      this.activeFilters = activeFilters || this.quickSearchService.getActiveFilters(this.filterQuery, this.storedFilters, this.availableObjectTypeFields);

      this.availableFilterGroups = [
        {
          id: 'active',
          label: this.translate.instant('yuv.framework.search.filter.recent.filters'),
          items: [...this.activeFilters, ...this.updateLastFilters(lastFilters)]
        },
        {
          id: 'stored',
          label: this.translate.instant('yuv.framework.search.filter.stored.filters'),
          items: this.storedFilters.filter((f) => (visibleFilters ? visibleFilters.includes(f.id) : true))
        }
      ];

      if (this.viewMode === 'groups') {
        const filters = this.availableFilterGroups[1].items;
        this.availableFilterGroups = [
          this.availableFilterGroups[0],
          {
            id: 'custom',
            label: this.translate.instant('yuv.framework.search.filter.custom.filters'),
            items: filters.filter((f) => f.highlight)
          },
          ...this.quickSearchService.getAvailableFilterGroups(filters, this.availableObjectTypeFields)
        ];
      }

      this.setupCollapsedGroups();
    });
  }

  updateLastFilters(ids: string[]) {
    return (this.lastFilters = (ids || [])
      .filter((id) => !this.filterSelection.includes(id))
      .slice(0, 5)
      .map((id) => this.storedFilters.find((f) => f.id === id))
      .filter((f) => f)).sort(Utils.sortValues('label'));
  }

  showFilterConfig() {
    const pickerData: any = {
      query: this.filterQuery,
      typeSelection: [...this.typeSelection]
    };
    const popoverConfig: PopoverConfig = {
      width: '55%',
      height: '75%',
      data: pickerData
    };
    this.popoverService
      .open(this.tplFilterConfig, popoverConfig)
      .afterClosed()
      .subscribe(() => this.setupFilters(this.typeSelection, this.activeFilters));
  }

  onFilterChange(res: Selectable[]) {
    // todo: find best UX (maybe css animation)
    this.activeFilters = [...res];
    this.quickSearchService.saveLastFilters(this.filterSelection).subscribe((lastFilters) => {
      this.availableFilterGroups[0].items = [...this.activeFilters, ...this.updateLastFilters(lastFilters)];
    });
    this.filterQuery.filters = (res.map((v) => v.value) as SearchFilter[][])
      .reduce((pre, cur) => (pre = pre.concat(cur)), [])
      .concat(this.parentID ? [this.parentID] : []);
    this.filterChange.emit(this.filterQuery);
    this.aggregate();
  }

  onTypeChange(res: Selectable[]) {
    this.typeSelection = res.map((r) => r.id);
    this.setupFilters(this.typeSelection, this.activeFilters);
    // todo: remove unwanted filters
    this.filterQuery.types = [...this.typeSelection];
    this.filterChange.emit(this.filterQuery);
    this.aggregate();
  }

  saveSearch() {}

  resetFilters() {
    this.query = new SearchQuery(this._query.toQueryJson());
    this.filterChange.emit(new SearchQuery(this._query.toQueryJson()));
  }

  aggregate() {
    this.quickSearchService.getActiveTypes(this.filterQuery).subscribe((types: any) => {
      this.availableObjectTypes.forEach((i) => {
        const match = types.find((t) => t.id === i.id);
        i.count = match ? match.count : 0;
      });
      // remove all empty types that are part of query
      this.availableTypeGroups[0].items = this.availableObjectTypes.filter((t) => t.count || !this.filterQuery.types.find((id) => id === t.id));
    });
  }

  ngOnInit(): void {}
}
