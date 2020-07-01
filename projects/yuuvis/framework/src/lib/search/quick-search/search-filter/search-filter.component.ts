import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ApiBase, BackendService, BaseObjectTypeField, SearchFilter, SearchQuery, SystemService, SystemType, TranslateService, Utils } from '@yuuvis/core';
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
    if (this.parentID) {
      const data = {
        query: {
          statement: `SELECT COUNT(*), ${BaseObjectTypeField.OBJECT_TYPE_ID} FROM ${SystemType.OBJECT}
          WHERE ${BaseObjectTypeField.PARENT_ID}='${this.parentID.firstValue}' GROUP BY ${BaseObjectTypeField.OBJECT_TYPE_ID}`
        }
      };
      this.backend.post('/dms/objects/search', data, ApiBase.core).subscribe((res) => {
        const types = res.objects.map((o) => ({
          id: o.properties[BaseObjectTypeField.OBJECT_TYPE_ID].value,
          label: this.systemService.getLocalizedResource(`${o.properties[BaseObjectTypeField.OBJECT_TYPE_ID].value}_label`),
          count: o.properties.OBJECT_COUNT.value
        }));
        this.setupTypes(types);
      });
    } else {
      // todo: get aggregation counts
      this.setupTypes(
        this.filterQuery.types.map((o) => ({
          id: o,
          label: this.systemService.getLocalizedResource(`${o}_label`),
          count: 0
        }))
      );
    }
  }

  private setupTypes(types: Selectable[]) {
    this.typeSelection = types.map((t) => t.id);
    this.availableTypeGroups = [
      {
        id: 'types',
        label: 'Object Types',
        items: types
      }
    ];
    this.setupFilters(this.typeSelection);
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
          label: 'Active Filters',
          items: this.activeFilters
        },
        {
          id: 'stored',
          label: '★ Stored Filters',
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
  }

  saveSearch() {}

  resetFilters() {
    this.query = new SearchQuery(this._query.toQueryJson());
    this.filterChange.emit(new SearchQuery(this._query.toQueryJson()));
  }

  ngOnInit(): void {}
}
