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
  SearchResultItem,
  SearchService,
  SystemService,
  TranslateService
} from '@yuuvis/core';
import { ColDef } from 'ag-grid-community';
import { ResponsiveTableData } from '../../components';
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
  private _columns: ColDef[];
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
        titleField: 'clienttitle',
        descriptionField: 'clientdescription',
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
      // setup pagination form in case of a paged search result chunk
      this.pagingForm.get('page').setValue(this._searchResult.pagination.page);
      this.pagingForm
        .get('page')
        .setValidators([
          Validators.min(0),
          Validators.max(this._searchResult.pagination.pages)
        ]);
    }

    // create column definitions
    this._columns = this.gridService.getColumnConfiguration(
      resultListObjectType
    );

    // create the rows
    const rows = [];
    this._searchResult.items.forEach(i => {
      rows.push(this.getRow(i));
    });
    this._rows = rows;
  }

  /**
   * Map search result item to a row data item
   */
  private getRow(searchResultItem: SearchResultItem): any {
    const row = {
      id: searchResultItem.fields.get('enaio:objectId')
    };
    this._columns.forEach((cd: ColDef) => {
      // ContentStream fields needs to be resolved in a different way.

      // Object type schema defines content related fields with a
      // special pattern we can check for.

      // Although defined in schema there may be no content attached.
      if (
        searchResultItem.content &&
        cd.field.startsWith('enaio:contentStream')
      ) {
        switch (cd.field) {
          case 'enaio:contentStreamLength': {
            row[cd.field] = searchResultItem.content.size;
            break;
          }
          case 'enaio:contentStreamFileName': {
            row[cd.field] = searchResultItem.content.fileName;
            break;
          }
          case 'enaio:contentStreamMimeType': {
            row[cd.field] = searchResultItem.content.mimeType;
            break;
          }
          case 'enaio:contentStreamRange': {
            row[cd.field] = searchResultItem.content.range;
            break;
          }
          case 'enaio:contentStreamRepositoryId': {
            row[cd.field] = searchResultItem.content.repositoryId;
            break;
          }
        }
      } else {
        row[cd.field] = searchResultItem.fields.get(cd.field);
      }
    });
    return row;
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
