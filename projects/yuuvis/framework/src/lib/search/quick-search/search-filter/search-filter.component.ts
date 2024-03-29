import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BaseObjectTypeField, SearchFilter, SearchFilterGroup, SearchQuery, SearchService, TranslateService } from '@yuuvis/core';
import { Observable, forkJoin, of } from 'rxjs';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { Selectable } from '../../../grouped-select';
import { SelectableGroup } from '../../../grouped-select/grouped-select/grouped-select.interface';
import { FileSizePipe } from '../../../pipes/filesize.pipe';
import { PluginSearchComponent } from '../../../plugins/plugin-search.component';
import { PluginsService } from '../../../plugins/plugins.service';
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

  scopeEnabled = false;
  scopeGroups: SelectableGroup[] = [];
  availableTypeGroups: SelectableGroup[] = [];
  availableObjectTypes: Selectable[] = [];
  typeSelection: string[] = [];
  customTypeSelection: string[] = [];

  availableFilterGroups: SelectableGroup[] = [];
  availableObjectTypeFields: Selectable[] = [];

  get mixedTypeSelection() {
    return [...this.typeSelection, ...this.customTypeSelection];
  }

  get filterSelection() {
    return (this.activeFilters || []).map((f) => f.id);
  }

  get scopeSelection() {
    return !this.filterQuery?.scope ? [] : this.filterQuery?.scope !== 'all' ? [this.filterQuery?.scope] : ['metadata', 'content'];
  }

  activeFilters: Selectable[] = [];
  storedFilters: Selectable[] = [];
  hiddenFilters: string[] = [];
  allFilters: Selectable[] = [];

  filesizePipe: FileSizePipe;
  _query: SearchQuery;
  private filterQuery: SearchQuery;
  private parentID: SearchFilter;

  @Input() set query(q: SearchQuery) {
    if (q) {
      this._query = q.clone();
      this.filterQuery = q.clone();
      this.setupFilterPanel();
    } else {
      this._query = null;
      this.filterQuery = null;
    }
  }

  private get customFilters(): Selectable[] {
    return this.availableObjectTypeFields.map((o) => ({ ...o, value: [new SearchFilter(o.id, o.defaultOperator, o.defaultValue)] }));
  }

  @Input() plugins: Observable<any[]>;

  @Output() filterChange = new EventEmitter<SearchQuery>();

  constructor(
    private translate: TranslateService,
    private iconRegistry: IconRegistryService,
    private quickSearchService: QuickSearchService,
    private popoverService: PopoverService,
    private layoutService: LayoutService,
    private searchService: SearchService,
    private pluginsService: PluginsService
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
    this.aggregate(false, [group.id]);
    this.saveLayoutOptions({
      collapsedGroups: (this._layoutOptions.collapsedGroups || []).filter((id) => id !== group.id).concat(group.collapsed ? [group.id] : [])
    });
  }

  onScopeChange(res: Selectable[]) {
    this.filterQuery.scope = (res.length === 2 ? 'all' : res.length === 1 ? res[0].id : undefined) as any;
    this.emitFilterChange();
  }

  modeChange(viewMode: FilterViewMode) {
    this.viewMode = viewMode;
    this.saveLayoutOptions({ viewMode });
    this.setupFilters(this.typeSelection, this.activeFilters);
  }

  private setupFilterPanel() {
    this.parentID = this.filterQuery.filters.find((f) => f.property === BaseObjectTypeField.PARENT_ID);
    // wait until loadFilterSettings
    forkJoin([this.quickSearchService.getActiveTypes(this.filterQuery), this.quickSearchService.loadFilterSettings()]).subscribe(([res]) =>
      this.setupTypes(res)
    );
  }

  private setupCollapsedGroups() {
    if (this._layoutOptions && this._layoutOptions.collapsedGroups) {
      [...this.availableFilterGroups, ...this.availableTypeGroups].forEach((g) => (g.collapsed = this._layoutOptions.collapsedGroups.includes(g.id)));
    }
  }

  private setupTypes(types: Selectable[]) {
    this.typeSelection = this.filterQuery.allTypes.length ? types.map((t) => t.id) : [];
    this.availableObjectTypes = [...types];
    this.availableTypeGroups = [
      {
        id: 'types',
        label: this.translate.instant('yuv.framework.search.filter.object.types'),
        items: types
      }
    ];

    this.setupScope();
    this.setupExtensions(true);
    return this.setupFilters(this.typeSelection);
  }

  private setupScope() {
    this.scopeEnabled = !!this.quickSearchService.SEARCH_QUERY_SCOPE && !!this.filterQuery.term;
    this.scopeGroups = [
      {
        id: 'scope',
        label: this.translate.instant('yuv.framework.search.filter.scope'),
        items: [
          {
            id: 'metadata',
            label: this.translate.instant('yuv.framework.search.filter.scope.metadata')
          },
          {
            id: 'content',
            label: this.translate.instant('yuv.framework.search.filter.scope.content')
          }
        ]
      }
    ];
  }

  private setupExtensions(update = false) {
    (this.plugins || of([])).subscribe((plugins) => {
      const { active, all } = this.quickSearchService.getActiveExtensions(this._query);
      if (update) this.typeSelection = [...this.typeSelection, ...active];
      this.availableObjectTypeFields = this.quickSearchService.getAvailableObjectTypesFields(this.typeSelection);
      const extensions = PluginSearchComponent.parseExtensions(plugins, this, this.pluginsService);

      this.availableTypeGroups = this.availableTypeGroups.slice(0, 1);

      if (all.length || extensions.length) {
        const items = [...all, ...(extensions.filter((e: any) => !e.items) as any)];
        items.length &&
          this.availableTypeGroups.push({
            id: 'extensions',
            label: this.translate.instant('yuv.framework.search.filter.object.extensions'),
            items
          });
        this.availableTypeGroups = [...this.availableTypeGroups, ...(extensions.filter((e: any) => e.items) as any)];
        this.setupCollapsedGroups();
        this.aggregate(true);
      }
    });
  }

  private setupFilters(typeSelection: string[], activeFilters?: Selectable[]) {
    this.availableObjectTypeFields = this.quickSearchService.getAvailableObjectTypesFields(typeSelection);
    const tagGroups = this.quickSearchService
      .groupFilters(this.customFilters)
      .filter((g) => g.id.startsWith(BaseObjectTypeField.TAGS))
      .map((g) => g.items.shift() && g);

    this.quickSearchService.getCurrentSettings().subscribe(([storedFilters, hiddenFilters, lastFilters]) => {
      this.storedFilters = this.quickSearchService.loadFilters(storedFilters as any, this.availableObjectTypeFields);
      this.hiddenFilters = hiddenFilters;
      this.allFilters = [...this.storedFilters, ...tagGroups.reduce((prev, cur) => [...prev, ...cur.items], [])];
      this.activeFilters = activeFilters || this.quickSearchService.getActiveFilters(this.filterQuery, this.allFilters, this.availableObjectTypeFields);

      this.availableFilterGroups = [
        {
          id: 'active',
          label: this.translate.instant('yuv.framework.search.filter.recent.filters'),
          items: [...this.activeFilters, ...this.updateLastFilters(lastFilters)]
        },
        ...tagGroups,
        {
          id: 'stored',
          label: this.translate.instant('yuv.framework.search.filter.stored.filters'),
          items: this.storedFilters.filter((f) => !this.hiddenFilters.includes(f.id))
        }
      ];

      if (this.viewMode === 'groups') {
        const filters = this.availableFilterGroups[this.availableFilterGroups.length - 1].items;
        this.availableFilterGroups = [
          this.availableFilterGroups[0],
          ...tagGroups,
          {
            id: 'custom',
            label: this.translate.instant('yuv.framework.search.filter.custom.filters'),
            items: filters.filter((f) => f.highlight)
          },
          ...this.quickSearchService.getAvailableFilterGroups(filters, this.availableObjectTypeFields)
        ];
      }

      this.quickSearchService.saveLastFilters(this.filterSelection.filter((f) => !f.startsWith('#'))).subscribe();

      this.setupCollapsedGroups();
    });
  }

  updateLastFilters(ids: string[]) {
    const all = this.allFilters.map((f) => f.id);
    return (ids || [])
      .filter((id) => !this.filterSelection.includes(id) && !this.hiddenFilters.includes(id) && all.includes(id))
      .slice(0, 5)
      .map((id) => this.allFilters.find((f) => f.id === id));
  }

  showFilterConfig() {
    const pickerData: any = {
      query: this.filterQuery,
      typeSelection: [...this.typeSelection],
      sharedFields: true
    };
    const popoverConfig: PopoverConfig = {
      width: '55%',
      height: '75%',
      disableSmallScreenClose: true,
      data: pickerData
    };
    this.popoverService
      .open(this.tplFilterConfig, popoverConfig)
      .afterClosed()
      .subscribe(() => this.setupFilters(this.typeSelection));
  }

  onFilterChange(res: Selectable[]) {
    // todo: find best UX (maybe css animation)
    const active = this.filterSelection;
    const added = res.find((r) => !active.includes(r.id));
    this.activeFilters = [...res];

    if (added && !this.availableFilterGroups[0].items.find((i) => i.id === added.id)) {
      this.availableFilterGroups[0].items = [added, ...this.availableFilterGroups[0].items];
    }

    this.quickSearchService.saveLastFilters(this.filterSelection.filter((f) => !f.startsWith('#'))).subscribe();

    const groups = res.map((v) => SearchFilterGroup.fromArray(v.value)).concat(this.parentID ? SearchFilterGroup.fromArray([this.parentID]) : []);

    const q = new SearchQuery();
    groups.forEach((g) => {
      if (g.filters.length === 1) {
        const f = g.filters[0];
        q.addFilter(f, f.property, SearchFilterGroup.OPERATOR.OR);
      } else {
        q.addFilterGroup(g);
      }
    });
    this.filterQuery.filterGroup = SearchFilterGroup.fromQuery(q.filterGroup.toShortQuery());

    this.emitFilterChange();
  }

  onTypeChange(res: Selectable[]) {
    const _typeSelection = [...this.typeSelection];
    this.typeSelection = res.filter((r) => !r.value).map((r) => r.id);
    this.customTypeSelection = res.filter((r) => r.value).map((r) => r.id);

    this.setupFilters(this.typeSelection, this.activeFilters);
    this.quickSearchService.updateTypesAndLots(this.filterQuery, this.typeSelection);

    const customGroups = this.filterQuery.filterGroup.groups.map((g) => g.property).filter((property) => property !== SearchFilterGroup.DEFAULT);
    customGroups.forEach((g) => this.filterQuery.removeFilterGroup(g));
    res.forEach((r) => r.value && this.filterQuery.addFilterGroup(r.value.clone(), r.value.property));

    if (_typeSelection.join() !== this.typeSelection.join()) {
      this.setupExtensions();
    }
    this.emitFilterChange();
  }

  saveSearch() {}

  resetFilters() {
    this.query = this._query.clone();
    this.emitFilterChange(false);
  }

  emitFilterChange(aggregate = true) {
    this.filterChange.emit(this.filterQuery);
    if (aggregate) this.aggregate();
  }

  aggregate(skipTypes = false, groups?: string[]) {
    const queryNoLots = this.filterQuery.clone();
    queryNoLots.lots = [];
    !skipTypes &&
      !this.availableTypeGroups[0]?.collapsed &&
      this.quickSearchService.getActiveTypes(queryNoLots).subscribe((types: any) => {
        this.availableObjectTypes.forEach((i) => {
          const match = types.find((t) => t.id === i.id);
          i.count = match ? match.count : 0;
        });
        // remove all empty types that are part of original query
        this.availableTypeGroups[0].items = this.availableObjectTypes.filter((t) => t.count || this._query.allTypes.includes(t.id));
        this.typeSelection = [...this.typeSelection];
      });

    const sum = (r: any, key?: string) => r?.aggregations?.[0].entries.filter((e) => (key ? e.key === key : true)).reduce((p, c) => p + c.count, 0);

    this.availableTypeGroups
      ?.filter((group, i) => i > 0 && group.items?.length && !group.collapsed && (!groups || groups.includes(group.id)))
      .forEach((group) => {
        if (group.aggregations) {
          if (group.items[0].class?.match('skipCount')) return;
          const q = this.filterQuery.clone(true);
          q.filterGroup = this.filterQuery.filterGroup.clone(false);
          q.removeFilterGroup(group.id);
          this.searchService.aggregate(q, group.aggregations).subscribe((r) => group.items?.forEach((g) => (g.count = sum(r, g.label).toString() as any)));
        } else {
          group.items.forEach((g) => {
            if (g.class?.match('skipCount')) return;
            const q = this.filterQuery.clone(true);
            if (g.value) {
              q.filterGroup = this.filterQuery.filterGroup.clone(false);
              q.removeFilterGroup(g.value.property);
              q.addFilterGroup(g.value.clone());
            } else {
              q.types = [g.id];
            }
            this.searchService.aggregate(q, [BaseObjectTypeField.LEADING_OBJECT_TYPE_ID]).subscribe((r) => (g.count = sum(r).toString() as any));
          });
        }
      });
  }

  ngOnInit(): void {}
}
