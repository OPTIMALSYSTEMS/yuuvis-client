import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BackendService, BaseObjectTypeField, SearchFilter, SearchQuery, SystemService, TranslateService, Utils } from '@yuuvis/core';
import { forkJoin } from 'rxjs';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { Selectable } from '../../../grouped-select';
import { SelectableGroup } from '../../../grouped-select/grouped-select/grouped-select.interface';
import { FileSizePipe } from '../../../pipes/filesize.pipe';
import { PopoverConfig } from '../../../popover/popover.interface';
import { PopoverService } from '../../../popover/popover.service';
import { favorite, refresh, settings } from '../../../svg.generated';
import { QuickSearchService } from '../quick-search.service';

@Component({
  selector: 'yuv-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit {
  @ViewChild('tplFilterConfig') tplFilterConfig: TemplateRef<any>;

  availableTypeGroups: SelectableGroup[] = [];
  availableObjectTypes: Selectable[] = [];
  typeSelection: string[] = [];

  availableFilterGroups: SelectableGroup[] = [];
  availableObjectTypeFields: Selectable[] = [];
  filterSelection: string[] = [];

  activeFilters: Selectable[] = [];
  storedFilters: Selectable[] = [];

  filesizePipe: FileSizePipe;
  private _query: SearchQuery;
  private filterQuery: SearchQuery;
  private parentID: SearchFilter;

  @Input() set query(q: SearchQuery) {
    this._query = new SearchQuery(q.toQueryJson());
    this.filterQuery = new SearchQuery(q.toQueryJson());
    this.setupFilterPanel();
  }

  @Output() filterChange = new EventEmitter<SearchQuery>();

  constructor(
    private backend: BackendService,
    private translate: TranslateService,
    private systemService: SystemService,
    private iconRegistry: IconRegistryService,
    private quickSearchService: QuickSearchService,
    private popoverService: PopoverService
  ) {
    this.iconRegistry.registerIcons([settings, refresh, favorite]);
  }

  private setupFilterPanel() {
    this.parentID = this.filterQuery.filters.find((f) => f.property === BaseObjectTypeField.PARENT_ID);
    this.quickSearchService.getActiveTypes(this.filterQuery).subscribe((res: any) => this.setupTypes(res));
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
    return this.setupFilters(this.typeSelection);
  }

  private setupFilters(typeSelection: string[], filterSelection?: string[], activeFilters?: Selectable[]) {
    this.availableObjectTypeFields = this.quickSearchService.getAvailableObjectTypesFields(typeSelection);

    forkJoin([this.quickSearchService.loadStoredFilters(), this.quickSearchService.loadFiltersVisibility()]).subscribe(([storedFilters, visibleFilters]) => {
      this.storedFilters = this.quickSearchService.loadFilters(storedFilters as any, this.availableObjectTypeFields);
      this.activeFilters = activeFilters || this.quickSearchService.getActiveFilters(this.filterQuery, this.storedFilters, this.availableObjectTypeFields);
      const visible = visibleFilters || this.storedFilters.map((s) => s.id);

      this.availableFilterGroups = [
        {
          id: 'active',
          label: this.translate.instant('yuv.framework.search.filter.active.filters'),
          items: this.activeFilters
        },
        {
          id: 'stored',
          label: this.translate.instant('yuv.framework.search.filter.stored.filters'),
          items: this.storedFilters.filter((f) => visible.includes(f.id))
        }
      ];
      this.filterSelection = filterSelection || this.activeFilters.map((a) => a.id);
    });
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
      .subscribe(() => this.setupFilters(this.typeSelection, this.filterSelection, this.activeFilters));
  }

  onFilterChange(res: Selectable[]) {
    // todo: find best UX (maybe css animation)
    this.availableFilterGroups[0].items = this.activeFilters = [...res, ...this.activeFilters.filter((f) => !res.map((r) => r.id).includes(f.id))].sort(
      Utils.sortValues('label')
    );
    this.filterQuery.filters = (res.map((v) => v.value) as SearchFilter[][])
      .reduce((pre, cur) => (pre = pre.concat(cur)), [])
      .concat(this.parentID ? [this.parentID] : []);
    this.filterChange.emit(this.filterQuery);
    this.aggregate();
  }

  onTypeChange(res: Selectable[]) {
    this.setupFilters(
      res.map((r) => r.id),
      this.filterSelection,
      this.activeFilters
    );
    // todo: remove unwanted filters
    this.filterQuery.types = res.map((r) => r.id);
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
