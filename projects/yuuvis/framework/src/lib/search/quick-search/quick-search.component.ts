import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { SVGIcons } from '../../svg.generated';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SearchService, ScreenService, SystemService } from '@yuuvis/core';
import { of, forkJoin } from 'rxjs';

@Component({
  selector: 'yuv-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss'],
  host: { 'class': 'yuv-quick-search' }
})
export class QuickSearchComponent implements OnInit {

  @Input() width: string = '450px';
  @HostBinding('style.width') hostWidth: string = this.width;

  icSearch = SVGIcons.search;
  searchForm: FormGroup;
  invalidTerm: boolean;
  resultCount: number = null;
  result: any[] = [];
  private _term: string;


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
            this.searchService.search(`SELECT COUNT(*), enaio:objectTypeId FROM enaio:object WHERE CONTAINS('${term}') GROUP BY enaio:objectTypeId`) :
            of(null);
        })
      ).subscribe(res => {
        if (res) {
          this.resultCount = 0;
          res.objects.forEach(o => {
            this.resultCount += o.properties.OBJECT_COUNT.value;
            this.result.push({
              label: this.systemService.getLocalizedResource(`${o.properties['enaio:objectTypeId'].value}_label`),
              count: o.properties.OBJECT_COUNT.value
            });
          })
        } 
      })
  }

  executeSearch() {
    this.searchService.search(`SELECT * FROM enaio:object WHERE CONTAINS('${this._term}')`).subscribe(
      res => {

        this.result = res.objects.map(o => {
          return {
            label: o.properties['enaio:objectTypeId'].value
          }
        })


        console.log(res)
      }
    );
  }

  ngOnInit() {
  }

}
