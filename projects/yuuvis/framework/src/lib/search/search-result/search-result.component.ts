import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SearchResult, SystemService, SearchService } from '@yuuvis/core';
import { ResponsiveTableData, ResponsiveTableDataColumn } from '../../components';
import { SVGIcons } from '../../svg.generated';
import { FormControl, Validators, ValidatorFn, AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'yuv-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  host: { 'class': 'yuv-search-result yuv-panel toolbar' }
})
export class SearchResultComponent implements OnInit {

  _searchResult: SearchResult;
  private _columns: ResponsiveTableDataColumn[];
  private _rows: any[];
  pagingForm: FormGroup;

  // icons used within the template
  icon = {
    icSearch: SVGIcons['search'],
    icSearchFilter: SVGIcons['search-filter'],
    icArrowNext: SVGIcons['arrow-next'],
    icArrowLast: SVGIcons['arrow-last'],
  }
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
    private fb: FormBuilder,
    private systemService: SystemService) {
    this.pagingForm = this.fb.group({
      page: ['']
    });
  }

  // Create actual table data from the search result
  private createTableData(): void {

    if (this._searchResult.objectTypes.length === 0) return;

    // object type of the result list items, if NULL we got a mixed result
    const resultListObjectType = this._searchResult.objectTypes.length > 1 ? null : this._searchResult.objectTypes[0]

    if (this._searchResult.pagination) {
      this.pagingForm.get('page').setValue(this._searchResult.pagination.page);
      this.pagingForm.get('page').setValidators([
        Validators.min(0),
        Validators.max(this._searchResult.pagination.pages)
      ])
    }

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

  onPagingFormSubmit() {
    if (this.pagingForm.valid) {
      this.goToPage(this.pagingForm.value.page);
    }
  }

  goToPage(page: number) {
    this.searchService.getPage(this._searchResult, page).subscribe((res: SearchResult) => {
      this.searchResult = res;
    })
  }

  onSelectionChanged(selectedRows: any[]) {
    this.itemsSelected.emit(selectedRows.map(r => r.id));
  }

  ngOnInit() {
  }

}
