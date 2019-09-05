import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DmsService, SearchQuery, SystemService, TranslateService } from '@yuuvis/core';
import { SVGIcons } from '../../svg.generated';
import { SearchResultComponent } from '../search-result/search-result.component';

@Component({
  selector: 'yuv-search-result-panel',
  templateUrl: './search-result-panel.component.html',
  styleUrls: ['./search-result-panel.component.scss']
})
export class SearchResultPanelComponent implements OnInit {
  // icons used within the template
  icon = {
    icSearch: SVGIcons['search'],
    refresh: SVGIcons['refresh'],
    icKebap: SVGIcons['kebap']
  };

  _searchQuery: SearchQuery;
  queryTerm: string;

  @ViewChild(SearchResultComponent, { static: false }) searchResultComponent: SearchResultComponent;

  @Input() set query(searchQuery: SearchQuery) {
    this._searchQuery = searchQuery;
    if (searchQuery) {
      this.generateQueryDescription(searchQuery.term, searchQuery.types);
    }
  }
  @Input() title: string;
  @Input() selectedItemId: string;
  @Output() itemsSelected = new EventEmitter<string[]>();
  actionCMD: any = { show: false, selection: [] };
  private selectedItemIDs: any[];

  constructor(private translate: TranslateService, private systemService: SystemService, private dmsService: DmsService) {
    this.title = this.translate.instant('eo.search.title');
  }

  refresh() {
    if (this.searchResultComponent) {
      this.searchResultComponent.refresh();
    }
  }

  onItemsSelected(itemIDs) {
    this.itemsSelected.emit(itemIDs);
    this.selectedItemIDs = itemIDs;
  }

  generateQueryDescription(term: string, types?: string[]) {
    const querytype: string = types.length ? `${this.systemService.getLocalizedResource(`${types[0]}_label`)}, ` : '';
    this.queryTerm = `${querytype}${this.translate.instant('eo.search.term')}: '${term}'`;
  }

  ngOnInit() {}

  openActionMenu() {
    this.dmsService.getDmsObjects(this.selectedItemIDs).subscribe(items => {
      this.actionCMD = { show: true, selection: items };
    });
  }

  onActionFinish() {
    alert('HURZ');
  }
}
