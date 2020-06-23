import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchFilter, SearchQuery, Utils } from '@yuuvis/core';
import { forkJoin } from 'rxjs';
import { Selectable } from '../../../grouped-select';
import { SelectableGroup } from './../../../grouped-select/grouped-select/grouped-select.interface';
import { QuickSearchService } from './../quick-search.service';

@Component({
  selector: 'yuv-search-filter-config',
  templateUrl: './search-filter-config.component.html',
  styleUrls: ['./search-filter-config.component.scss']
})
export class SearchFilterConfigComponent implements OnInit {
  storedFiltersGroups: SelectableGroup[] = [];
  availableFiltersGroups: SelectableGroup[] = [];
  availableObjectTypeFields: Selectable[];

  visibleFilters: string[] = [];
  storedFilters: Selectable[];
  selectedFilter: Selectable;
  selection: string[] = [];
  formOptions: any;

  query: SearchQuery;

  @Input() set options(data: { typeSelection: string[]; query: SearchQuery }) {
    this.query = data.query;
    this.availableObjectTypeFields = this.quickSearchService.getAvailableObjectTypesFields(data.typeSelection);

    forkJoin([this.quickSearchService.loadFilters(this.availableObjectTypeFields), this.quickSearchService.loadFiltersVisibility()]).subscribe(
      ([storedFilters, visibleFilters]) => {
        this.storedFilters = storedFilters;
        this.visibleFilters = visibleFilters || storedFilters.map((f) => f.id);
        this.storedFiltersGroups = [
          {
            id: 'active',
            label: 'Active Filters',
            items: this.quickSearchService.getActiveFilters(this.query, storedFilters, this.availableObjectTypeFields)
          },
          {
            id: 'activated',
            label: 'Filters',
            items: storedFilters.filter((f) => this.isVisible(f))
          },
          {
            id: 'deactivated',
            label: 'Deactivated Filters',
            items: storedFilters.filter((f) => !this.isVisible(f))
          }
        ];
        this.availableFiltersGroups = [
          {
            id: 'custom',
            label: 'Custom Filters',
            items: this.availableObjectTypeFields.map((o) => ({ ...o, value: [new SearchFilter(o.id, undefined, undefined)] }))
          }
        ];
        // load active filters
        this.createNew(this.query.filters);
      }
    );
  }
  @Output() close = new EventEmitter<any>();

  constructor(private quickSearchService: QuickSearchService) {}

  isVisible(filter = this.selectedFilter) {
    return filter && this.visibleFilters.includes(filter.id);
  }

  isDefault(filter = this.selectedFilter) {
    return filter && !filter.highlight;
  }

  isStored(filter = this.selectedFilter) {
    return filter && !!this.storedFilters.find((f) => f.id === filter.id);
  }

  createNew(filters: SearchFilter[] = []) {
    this.onFilterSelect({
      id: Utils.uuid(),
      label: '',
      highlight: true,
      value: [...filters]
    });
  }

  onFilterSelect(res: Selectable) {
    this.selectedFilter = res;
    this.selection = res.value.map((f) => f.property);
    this.availableFiltersGroups[0].items = this.availableFiltersGroups[0].items.map((i) => ({ ...i, disabled: this.isDefault() }));
    this.formOptions = { filter: this.selectedFilter, activeFilters: res.value, availableObjectTypeFields: this.availableObjectTypeFields };
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
    this.storedFiltersGroups[1].items = this.storedFilters.filter((f) => this.isVisible(f));
    this.storedFiltersGroups[2].items = this.storedFilters.filter((f) => !this.isVisible(f));
    this.quickSearchService.saveFiltersVisibility(this.visibleFilters);
  }

  onControlRemoved(id: string) {
    this.selection = this.selection.filter((f) => f !== id);
    console.log(id);
  }

  onFilterChanged(res: Selectable) {
    this.selectedFilter = res;
    console.log(res.value);
  }

  onSave() {
    this.quickSearchService.saveFilter(this.selectedFilter);
    // todo : find better way
    this.storedFilters = [this.selectedFilter, ...this.storedFilters.filter((s) => s.id !== this.selectedFilter.id)];
    this.onVisibilityChange(false);
  }

  ngOnInit() {}
}
