import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  ScreenService,
  SearchQuery,
  SearchService,
  SystemService
} from '@yuuvis/core';
import { of } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
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

  private searchQuery: SearchQuery;
  private _term: string;

  // emits the query that should be executed
  @Output() query = new EventEmitter<SearchQuery>();

  constructor(
    private fb: FormBuilder,
    private screenService: ScreenService,
    private systemService: SystemService,
    private searchService: SearchService
  ) {
    this.searchForm = this.fb.group({ searchInput: [''] });
    this.searchForm
      .get('searchInput')
      .valueChanges.pipe(
        tap(term => {
          // this._term = term;
          this.searchQuery.term = term;
          this.aggTypes = [];
          this.resultCount = null;
        }),
        debounceTime(500),
        switchMap(term => {
          return this.searchQuery.term && this.searchQuery.term.length
            ? this.searchService.searchRaw(
                `SELECT COUNT(*), enaio:objectTypeId FROM enaio:object WHERE CONTAINS('${
                  this.searchQuery.term
                }') GROUP BY enaio:objectTypeId`
              )
            : of(null);
        })
      )
      .subscribe((res: any) => {
        this.processResult(res);
      });
  }

  executeSearch() {
    this.query.emit(this.searchQuery);
  }

  onAggObjectTypeClick(agg: ObjectTypeAggregation) {
    this.searchQuery.addType(agg.objectTypeId);
    this.executeSearch();
  }

  private processResult(res: any) {
    if (res) {
      this.resultCount = 0;

      res.objects.forEach(o => {
        this.resultCount += o.properties.OBJECT_COUNT.value;
        const typeId = o.properties['enaio:objectTypeId'].value;
        this.aggTypes.push({
          objectTypeId: typeId,
          label:
            this.systemService.getLocalizedResource(`${typeId}_label`) ||
            `${typeId}`,
          count: o.properties.OBJECT_COUNT.value
        });
      });
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
