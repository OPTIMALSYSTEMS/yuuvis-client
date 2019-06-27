import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SearchResult, SystemService, SearchService } from '@yuuvis/core';
import { ResponsiveTableData, ResponsiveTableDataColumn } from '../../components';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  host: { 'class': 'yuv-search-result yuv-panel toolbar' }
})
export class SearchResultComponent implements OnInit {

  private _searchResult: SearchResult;
  private _columns: ResponsiveTableDataColumn[];
  private _rows: any[];

  icSearch = SVGIcons['search'];
  icSearchFilter = SVGIcons['search-filter'];
  tableData: ResponsiveTableData;

  @Input() set searchResult(searchResult: SearchResult) {
    this._searchResult = searchResult;
    if (searchResult) {
      // create data for responsive table from the search result
      this.createTableData();
      this.tableData = {
        columns: this._columns,
        rows: this._rows,
        titleField: 'title',
        descriptionField: 'description',
        selectType: 'single'
      }
    }
  }
  @Input() selectedItemId: string;
  // emits the current selection as list of object IDs
  @Output() itemsSelected = new EventEmitter<string[]>();


  constructor(private searchService: SearchService,
    private systemService: SystemService) { }

  private createTableData(): void {

    if(this._searchResult.objectTypes.length === 0) return;
    // object type of the result list items, if NULL we got a mixed result
    const resultListObjectType = this._searchResult.objectTypes.length > 1 ? null : this._searchResult.objectTypes[0]

    const columnFields = this.searchService.getColumnConfiguration(resultListObjectType);
    const rows = [];
    this._searchResult.items.forEach(i => {
      const r = {};
      columnFields.forEach((key) => {
        r[(key === 'enaio:objectId') ? 'id' : key] = i.fields.get(key);
      });
      rows.push(r);
    })

    this._columns = columnFields.map(key => ({
      field: (key === 'enaio:objectId') ? 'id' : key,
      headerName: this.systemService.getLocalizedResource(key),
      resizable: true,
      sortable: false
    }));
    this._rows = rows;
  }

  onSelectionChanged(selectedRows: any[]) {
    this.itemsSelected.emit(selectedRows.map(r => r.id));
  }

  ngOnInit() {
  }

}
