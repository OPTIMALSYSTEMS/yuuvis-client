import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  SearchResult,
  SearchService,
  SystemService,
  TranslateService
} from '@yuuvis/core';
import {
  ResponsiveTableData,
  ResponsiveTableDataColumn
} from '../../components';
import { GridService } from '../../services/grid/grid.service';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
  host: { class: 'yuv-search-result yuv-panel toolbar' }
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
    icArrowLast: SVGIcons['arrow-last']
  };
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
      };
    }
  }
  @Input() title: string;
  @Input() selectedItemId: string;
  // emits the current selection as list of object IDs
  @Output() itemsSelected = new EventEmitter<string[]>();

  // indicator that the component is busy loading data, so we are able to prevent user interaction
  @HostBinding('class.busy') busy: boolean = false;

  constructor(
    private translate: TranslateService,
    private gridService: GridService,
    private searchService: SearchService,
    private fb: FormBuilder,
    private systemService: SystemService
  ) {
    this.title = this.translate.instant('eo.search.title');
    this.pagingForm = this.fb.group({
      page: ['']
    });
  }

  // Create actual table data from the search result
  private createTableData(): void {
    if (this._searchResult.objectTypes.length === 0) return;

    // object type of the result list items, if NULL we got a mixed result
    const resultListObjectType =
      this._searchResult.objectTypes.length > 1
        ? null
        : this._searchResult.objectTypes[0];

    if (this._searchResult.pagination) {
      this.pagingForm.get('page').setValue(this._searchResult.pagination.page);
      this.pagingForm
        .get('page')
        .setValidators([
          Validators.min(0),
          Validators.max(this._searchResult.pagination.pages)
        ]);
    }

    const columnFields = this.gridService.getColumnConfiguration(
      resultListObjectType
    );
    const rows = [];
    this._searchResult.items.forEach(i => {
      const r = {};
      columnFields.forEach(key => {
        r[key === 'enaio:objectId' ? 'id' : key] = i.fields.get(key);
      });
      rows.push(r);
    });

    const colDefDefaults = {
      suppressMovable: true
    };

    this._columns = columnFields.map(key => ({
      ...{
        field: key === 'enaio:objectId' ? 'id' : key,
        headerName: this.systemService.getLocalizedResource(key),
        resizable: true,
        sortable: false
      },
      ...colDefDefaults
    }));
    this._rows = rows;
  }

  onPagingFormSubmit() {
    if (this.pagingForm.valid) {
      this.goToPage(this.pagingForm.value.page);
    }
  }

  goToPage(page: number) {
    this.busy = true;
    this.searchService.getPage(this._searchResult, page).subscribe(
      (res: SearchResult) => {
        this.searchResult = res;
      },
      err => {
        // TODO: how should errors be handles in case hat loading pages fail
      },
      () => {
        this.busy = false;
      }
    );
  }

  onSelectionChanged(selectedRows: any[]) {
    this.itemsSelected.emit(selectedRows.map(r => r.id));
  }

  ngOnInit() {}
}
