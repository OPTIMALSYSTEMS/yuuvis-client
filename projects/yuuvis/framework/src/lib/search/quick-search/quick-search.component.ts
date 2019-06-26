import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { SVGIcons } from '../../svg.generated';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SearchService, ScreenService, SystemService, SearchResult } from '@yuuvis/core';
import { of } from 'rxjs';

@Component({
  selector: 'yuv-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss'],
  host: { 'class': 'yuv-quick-search' }
})
export class QuickSearchComponent implements OnInit {

  icSearch = SVGIcons.search;
  searchForm: FormGroup;
  invalidTerm: boolean;
  resultCount: number = null;
  result: any[] = [];
  private _term: string;

  // emits the query that should be executed
  @Output() query = new EventEmitter<string>();


  constructor(private fb: FormBuilder,
    private screenService: ScreenService,
    private systemService: SystemService,
    private searchService: SearchService) {

    this.searchForm = this.fb.group({ searchInput: [''] });
    this.searchForm
      .get('searchInput').valueChanges.pipe(
        tap(term => {
          this._term = term;
          this.result = [];
          this.resultCount = null;
        }),
        debounceTime(500),
        switchMap(term => {
          return (term && term.length) ?
            this.searchService.searchRaw(`SELECT COUNT(*), enaio:objectTypeId FROM enaio:object WHERE CONTAINS('${term}') GROUP BY enaio:objectTypeId`) :
            of(null);
        })
      ).subscribe((res: any) => {
        if (res) {
          this.resultCount = 0;
          res.objects.forEach(o => {
            this.resultCount += o.properties.OBJECT_COUNT.value;
            this.result.push({
              label: this.systemService.getLocalizedResource(`${o.properties['enaio:objectTypeId'].value}_label`),
              count: o.properties.OBJECT_COUNT.value
            });
          });
        }
      })
  }

  executeSearch() {
    this.query.emit(`SELECT * FROM enaio:object WHERE CONTAINS('${this._term}')`);
  }

  ngOnInit() {
  }

}
