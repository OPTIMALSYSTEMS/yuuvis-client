import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseObjectTypeField, ScreenService, SearchQuery, SearchService, SystemService, Utils } from '@yuuvis/core';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss'],
  host: { class: 'yuv-quick-search' }
})
export class QuickSearchComponent implements OnInit {
  icSearch = SVGIcons.search;
  searchForm: FormGroup;
  invalidTerm: boolean;
  resultCount: number = null;
  aggTypes: ObjectTypeAggregation[] = [];
  searchHasResults: boolean = true;
  private searchQuery: SearchQuery;

  // emits the query that should be executed
  @Output() query = new EventEmitter<SearchQuery>();

  constructor(private fb: FormBuilder, private screenService: ScreenService, private systemService: SystemService, private searchService: SearchService) {
    this.searchForm = this.fb.group({ searchInput: [''] });
    this.searchForm
      .get('searchInput')
      .valueChanges.pipe(
        distinctUntilChanged(),
        tap(term => {
          this.searchQuery.term = term;
          this.aggTypes = [];
          this.resultCount = null;
        }),
        debounceTime(800),
        filter(term => term.length),
        switchMap(term => this.searchService.aggregate(this.searchQuery, BaseObjectTypeField.OBJECT_TYPE_ID))
      )
      .subscribe((res: { value: string; count: number }[]) => {
        this.processAggregateResult(res);
      });
  }

  executeSearch() {
    if (this.searchQuery.term) {
      this.query.emit(this.searchQuery);
    }
  }

  onAggObjectTypeClick(agg: ObjectTypeAggregation) {
    this.searchQuery.addType(agg.objectTypeId);
    this.executeSearch();
  }

  private processAggregateResult(res: { value: string; count: number }[]) {
    if (res && res.length) {
      this.searchHasResults = true;
      this.resultCount = 0;

      res.forEach(item => {
        this.resultCount += item.count;
        this.aggTypes.push({
          objectTypeId: item.value,
          label: this.systemService.getLocalizedResource(`${item.value}_label`) || item.value,
          count: item.count
        });
      });
      this.aggTypes.sort(Utils.sortValues('label'));
    } else {
      this.searchHasResults = false;
    }
  }

  ngOnInit() {
    this.searchQuery = new SearchQuery();
  }
}

interface ObjectTypeAggregation {
  objectTypeId: string;
  label: string;
  count: number;
}
