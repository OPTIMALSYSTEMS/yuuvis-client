import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SearchFilter, SearchQuery, TranslateService, Utils } from '@yuuvis/core';
import { forkJoin } from 'rxjs';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { Selectable } from '../../../grouped-select';
import { NotificationService } from '../../../services/notification/notification.service';
import { addCircle, clear } from '../../../svg.generated';
import { SelectableGroup } from './../../../grouped-select/grouped-select/grouped-select.interface';
import { QuickSearchService } from './../quick-search.service';

@Component({
  selector: 'yuv-search-filter-config',
  templateUrl: './search-filter-config.component.html',
  styleUrls: ['./search-filter-config.component.scss']
})
export class SearchFilterConfigComponent implements OnInit {
  @ViewChild('storedFilterInput') storedFilterInput: ElementRef;

  storedFiltersGroups: SelectableGroup[] = [];
  availableFiltersGroups: SelectableGroup[] = [];
  availableObjectTypeFields: Selectable[];

  visibleFilters: string[] = [];
  storedFilters: Selectable[] = [];
  selectedFilter: Selectable = { id: '', label: '' };
  selection: string[] = [];
  formOptions: any;
  formValid = false;
  fromActive = true;

  query: SearchQuery;

  @Input() set options(data: { typeSelection: string[]; query: SearchQuery }) {
    this.query = data.query;
    this.availableObjectTypeFields = this.quickSearchService.getAvailableObjectTypesFields(data.typeSelection);

    this.availableFiltersGroups = [
      {
        id: 'form',
        label: this.translate.instant('yuv.framework.quick-search.field-select.tooltip'),
        items: this.availableObjectTypeFields.map((o) => ({ ...o, value: [new SearchFilter(o.id, undefined, undefined)] }))
      }
    ];

    // load active filters
    // this.createNew(this.query.filters);
    this.createNew();

    forkJoin([this.quickSearchService.loadStoredFilters(), this.quickSearchService.loadFiltersVisibility()]).subscribe(([storedFilters, visibleFilters]) => {
      this.storedFilters = this.quickSearchService.loadFilters(storedFilters as any, this.availableObjectTypeFields);
      this.visibleFilters = visibleFilters || this.storedFilters.map((f) => f.id);
      this.storedFiltersGroups = [
        {
          id: 'custom',
          label: this.translate.instant('yuv.framework.search.filter.custom.filters'),
          items: this.getDefaultFilters()
        },
        {
          id: 'enabled',
          label: this.translate.instant('yuv.framework.search.filter.enabled.filters'),
          items: this.storedFilters.filter((f) => this.isVisible(f))
        },
        {
          id: 'disabled',
          label: this.translate.instant('yuv.framework.search.filter.disabled.filters'),
          items: this.storedFilters.filter((f) => !this.isVisible(f))
        }
      ];
    });
  }
  @Output() close = new EventEmitter<any>();

  constructor(
    private quickSearchService: QuickSearchService,
    private notify: NotificationService,
    private translate: TranslateService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([addCircle, clear]);
  }

  isVisible(filter = this.selectedFilter) {
    return filter && filter.id && this.visibleFilters.includes(filter.id);
  }

  isDefault(filter = this.selectedFilter) {
    return filter && filter.id && !filter.highlight;
  }

  isStored(filter = this.selectedFilter) {
    return filter && filter.id && !!this.storedFilters.find((f) => f.id === filter.id);
  }

  isEmpty(filter = this.selectedFilter) {
    return filter && filter.id && !(filter.value && filter.value.length);
  }

  createNew(filters: SearchFilter[] = []) {
    this.onFilterSelect({
      id: Utils.uuid(),
      label: '',
      highlight: true,
      value: [...filters]
    });
  }

  getDefaultFilters() {
    return [
      {
        id: '__create_new',
        svg: addCircle.data,
        label: this.translate.instant('yuv.framework.search.filter.create.new'),
        value: []
      },
      this.query.filters.length && {
        id: '__create_new#active',
        svg: addCircle.data,
        label: `${this.translate.instant('yuv.framework.search.filter.create.new')} (${this.translate.instant('yuv.framework.search.filter.from.active')})`,
        value: [...this.query.filters]
      },
      ...this.storedFilters.filter((f) => this.isVisible(f) && f.highlight)
    ].filter((f) => f);
  }

  onFilterSelect(res: Selectable) {
    if (res.id.startsWith('__create_new')) {
      this.createNew(res.value);
    } else {
      this.selectedFilter = res;
      this.selection = res.value.map((f) => f.property);
      this.availableFiltersGroups[0].items = this.availableFiltersGroups[0].items.map((i) => ({ ...i, disabled: this.isDefault() }));
      this.formOptions = { filter: this.selectedFilter, activeFilters: res.value, availableObjectTypeFields: this.availableObjectTypeFields };
    }
  }

  onActiveFilterChange(res: Selectable[]) {
    this.selection = res.map((f) => f.id);
    this.formOptions = { filter: this.selectedFilter, activeFilters: res.map((f) => f.value[0]), availableObjectTypeFields: this.availableObjectTypeFields };
  }

  onClose() {
    this.close.emit();
  }

  onVisibilityChange(visible = this.isVisible()) {
    this.visibleFilters = this.visibleFilters.filter((id) => id !== this.selectedFilter.id).concat(visible ? [] : [this.selectedFilter.id]);
    this.storedFiltersGroups[0].items = this.getDefaultFilters();
    this.storedFiltersGroups[1].items = this.storedFilters.filter((f) => this.isVisible(f));
    this.storedFiltersGroups[2].items = this.storedFilters.filter((f) => !this.isVisible(f));
    this.quickSearchService.saveFiltersVisibility(this.visibleFilters).subscribe();
  }

  onControlRemoved(id: string) {
    this.selection = this.selection.filter((f) => f !== id);
    console.log(id);
  }

  onFilterChanged(res: Selectable) {
    this.selectedFilter = res;
  }

  onFilterNameChanged(name: string) {
    this.selectedFilter.label = name;
  }

  onSave() {
    if (this.formValid && this.selectedFilter.label && !this.isEmpty()) {
      this.quickSearchService.saveFilter(this.selectedFilter).subscribe((storedFilters) => {
        this.storedFilters = this.quickSearchService.loadFilters(storedFilters as any, this.availableObjectTypeFields);
        this.onVisibilityChange(false);
        this.notify.success(this.translate.instant('yuv.framework.search.filter.configuration'), this.translate.instant('yuv.framework.search.filter.saved'));
      });
    } else if (!this.selectedFilter.label) {
      this.storedFilterInput.nativeElement.focus();
    }
  }

  onRemove() {
    this.quickSearchService.removeFilter(this.selectedFilter).subscribe((storedFilters) => {
      this.storedFilters = this.quickSearchService.loadFilters(storedFilters as any, this.availableObjectTypeFields);
      this.onVisibilityChange(true);
      this.notify.success(this.translate.instant('yuv.framework.search.filter.configuration'), this.translate.instant('yuv.framework.search.filter.removed'));
      this.createNew();
    });
  }

  ngOnInit() {}
}
