import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridOptions, Module } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { Component, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { PendingChangesService, SystemService, TranslateService } from '@yuuvis/core';
// import {CsvExportModule} from '@ag-grid-community/csv-export';
import { forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnsubscribeOnDestroy } from '../../common/util/unsubscribe.component';
import { GridService } from '../../services/grid/grid.service';
import { ObjectFormOptions } from '../object-form.interface';
import { RowEditComponent } from './row-edit/row-edit.component';

// data to be passed to the table component
export interface TableComponentParams {
  // current form situation (EDIT, SEARCH or CREATE)
  situation: string;
  // table size (medium, large)
  size: string;
  // the tables from element
  element: any;
}

// representation of a row while editing
export interface EditRow {
  situation: string;
  index: number;
  formOptions: ObjectFormOptions;
  tableElement: any;
}

// result of editing a tables row
export interface EditRowResult {
  index: number;
  rowData: any;
  createNewRow: boolean;
}

@Component({
  selector: 'yuv-table',
  templateUrl: './form-element-table.component.html',
  styleUrls: ['./form-element-table.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormElementTableComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FormElementTableComponent),
      multi: true
    }
  ]
})
export class FormElementTableComponent extends UnsubscribeOnDestroy implements ControlValueAccessor, Validator {
  public modules: Module[] = [ClientSideRowModelModule, CsvExportModule];
  // public modules: Module[] = [ClientSideRowModelModule];

  @ViewChild('rowEdit') rowEdit: RowEditComponent;

  @Input()
  set params(p: TableComponentParams) {
    if (p) {
      this._params = p;
      if (this._params.situation === 'SEARCH') {
        this._params.size = 'supersmall';
      } else if (!this._params.size) {
        this._params.size = 'small';
      }
      this.gridReady = false;
      this._elements = p.element.elements;
      this.gridOptions.columnDefs = this.createColumnDefinition();
      if (this._params.situation === 'SEARCH') {
        this.gridOptions.columnDefs.push({
          headerName: '',
          colId: 'actions',
          width: 34,
          minWidth: 34,
          pinned: 'right',
          cellRenderer: this.actionsCellRenderer
        });
      } else {
        this.overlayGridOptions.columnDefs = this.createColumnDefinition();
      }

      this.gridReady = true;
    }
  }
  get params() {
    return this._params;
  }

  _params: TableComponentParams;
  private _elements: any[];
  gridReady = false;
  value: any[];
  innerValue: any[];
  gridOptions: GridOptions;
  overlayGridOptions: GridOptions;
  editingRow: EditRow;
  showDialog = false;

  constructor(
    private systemService: SystemService,
    private pendingChanges: PendingChangesService,
    public gridApi: GridService,
    private translate: TranslateService
  ) {
    super();
    this.gridOptions = <GridOptions>{
      context: {},
      headerHeight: 30,
      rowHeight: 30,
      rowBuffer: 20,
      multiSortKey: 'ctrl',
      accentedSort: true,
      suppressCellSelection: true,
      rowSelection: 'single',
      suppressMovableColumns: true,
      enableFilter: false,
      suppressNoRowsOverlay: true,
      suppressLoadingOverlay: true,
      suppressContextMenu: true
    };
    this.gridOptions.context.tableComponent = this;

    this.overlayGridOptions = <GridOptions>{
      context: {},
      headerHeight: 30,
      rowHeight: 30,
      rowBuffer: 20,
      multiSortKey: 'ctrl',
      accentedSort: true,
      suppressCellSelection: true,
      rowSelection: 'single',
      suppressMovableColumns: true,
      enableFilter: false,
      suppressNoRowsOverlay: true,
      suppressLoadingOverlay: true,
      suppressContextMenu: true
    };
    this.overlayGridOptions.context.tableComponent = this;
    this.overlayGridOptions.rowClassRules = {
      'new-row': function (params) {
        if (params.data.isNewRow) {
          delete params.data.isNewRow;
          delete params.context.tableComponent.innerValue[params.context.tableComponent.innerValue.length - 1].isNewRow;
          return true;
        } else {
          return false;
        }
      }
    };

    this.pendingChanges.tasks$.pipe(takeUntil(this.componentDestroyed$)).subscribe((tasks) => {
      setTimeout(() => {
        this.overlayGridOptions.suppressRowClickSelection = !!this.rowEdit && !!tasks.find((task) => task.id === this.rowEdit.pendingTaskId);
      }, 0);
    });
  }

  actionsCellRenderer(params) {
    let div = document.createElement('div');

    if (params.context.tableComponent.params.situation === 'SEARCH') {
      div.innerHTML = `<div class="action-icon" id="actionIcon-${params.rowIndex}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
      </div>`;
      let clearIcon = div.querySelectorAll(`#actionIcon-${params.rowIndex}`)[0];
      clearIcon.addEventListener('click', () => params.context.tableComponent.clearRow(params.rowIndex));
    } else {
      div.innerHTML = `<div class="action-icon" id="actionIcon-${params.rowIndex}">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
      </svg>
      </div>`;
      let deleteIcon = div.querySelectorAll(`#actionIcon-${params.rowIndex}`)[0];
      deleteIcon.addEventListener('click', () => params.context.tableComponent.deleteRow(params.rowIndex));
    }

    return div;
  }

  propagateChange = (_: any) => {};

  writeValue(value: any[]): void {
    if (!value && this._params.situation === 'SEARCH') {
      // for search row data will always be one empty row
      // todo: re-enable again when search in tables is supported
      value = [{}];
    }
    this.value = value instanceof Array ? value : [];
    // create a clone of the actual value for internal usage
    this.innerValue = JSON.parse(JSON.stringify(this.value));

    if (this.gridOptions.api) {
      this.gridOptions.api.setRowData(this.innerValue);
    } else {
      this.gridOptions.rowData = this.innerValue;
    }

    if (this.overlayGridOptions.api) {
      this.overlayGridOptions.api.setRowData(this.innerValue);
      setTimeout(() => this.selectEditRow(), 0);
    } else {
      this.overlayGridOptions.rowData = this.innerValue;
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  /**
   * Create column definition from form element.
   * @returns column definition to be added to the gridOptions
   */
  private createColumnDefinition(): ColDef[] {
    return this._elements.map((el) => {
      let col: ColDef = this.gridApi.getColumnDefinition(el);
      Object.assign(col, {
        headerName: el.label,
        suppressMenu: true,
        filter: false,
        sortable: true,
        resizable: true,
        field: el.name,
        refData: {
          ...col.refData,
          _eoFormElement: el,
          _situation: this._params.situation
        }
      });
      return col;
    });
  }

  addRow() {
    const rowData = {};
    const asyncFetches = [];
    this._elements.forEach((el) => {
      if (el.defaultvalue !== undefined) {
        rowData[el.name] = el.defaultvalue;
      }
      // else if (el.defaultvaluefunction) {
      //   rowData[el.name] = this.systemService.getDefaultValue(el.defaultvaluefunction);
      //   if (el.defaultvaluefunction === 'CURRENT_USER') {
      //     asyncFetches.push(this.resolveOrgDataMeta(el.name, rowData[el.name]));
      //   }
      // }
    });
    if (asyncFetches.length > 0) {
      forkJoin(asyncFetches).subscribe((res: { key: string; value: any }[]) => {
        res.forEach((r) => {
          rowData[r.key] = r.value;
        });
        this.setEditRow(-1, rowData);
      });
    } else {
      this.setEditRow(-1, rowData);
    }
  }

  // private resolveOrgDataMeta(elementName: string, value: any) {
  //   return this.systemService.getOrganizationObject(value).pipe(
  //     map((res) => ({
  //       key: `${elementName}_meta`,
  //       value: res
  //     }))
  //   );
  // }

  editRow(event) {
    this.setEditRow(event.node.id, event.node.data);
  }

  onEditComplete(event) {
    //todo: is it obsolete?
  }

  private setEditRow(index: number, data: any) {
    // setup the row to be edited. Beside some properties, the
    // row contains a form model and form data. If the parent form model
    // provided a script, this will be added as well, so editing a row will
    // respect the form script.
    this.editingRow = {
      situation: this._params.situation,
      index: index,
      tableElement: this._params.element,
      formOptions: {
        formModel: {
          situation: this._params.situation, // required by object form for reading data
          elements: [
            {
              type: 'o2mGroup',
              elements: JSON.parse(JSON.stringify(this._elements))
            }
          ]
        },
        data,
        disabled: this._params.element.readonly
      }
    };
    this.showDialog = true;
    setTimeout(() => this.selectEditRow(), 0);
  }

  private selectEditRow() {
    if (this.overlayGridOptions.api) {
      this.overlayGridOptions.api.deselectAll();
      if (this.editingRow.index !== -1) {
        let rowNode = this.overlayGridOptions.api.getRowNode('' + this.editingRow.index);
        rowNode.setSelected(true, true);
        this.overlayGridOptions.api.ensureNodeVisible(rowNode);
      }
    }
  }

  private updateTableValue() {
    this.gridOptions.api.setRowData(this.innerValue);
    if (this.overlayGridOptions.api) {
      this.overlayGridOptions.api.setRowData(this.innerValue);
    } else {
      this.overlayGridOptions.rowData = this.innerValue;
    }
    this.value = this.innerValue.map((row) => {
      const rowValue = this._elements.map((el) => (row[el.name] ? row[el.name] : null));
      return rowValue;
    });
    this.propagateChange(this.value);
  }

  cancelRowEdit() {
    if (this.rowEdit) {
      this.rowEdit.finishPending();
    }
    this.editingRow = null;
    if (this._params.situation === 'SEARCH') {
      this.showDialog = false;
    }
  }

  onClose() {
    this.editingRow = null;
    this.showDialog = false;
  }

  updateRow(rowResult: any) {
    const isNewRow = rowResult.index === -1;
    if (isNewRow) {
      this.innerValue.push({ ...rowResult.rowData, ...{ isNewRow: true } });
    } else {
      this.innerValue[rowResult.index] = rowResult.rowData;
    }
    this.updateTableValue();
    if (this._params.situation === 'SEARCH') {
      this.showDialog = false;
    } else if (isNewRow && !rowResult.createNewRow) {
      this.setEditRow(this.innerValue.length - 1, this.innerValue[this.innerValue.length - 1]);
    } else if (rowResult.createNewRow) {
      this.addRow();
      let rowNode = this.overlayGridOptions.api.getRowNode('' + (this.innerValue.length - 1));
      this.overlayGridOptions.api.ensureNodeVisible(rowNode);
    } else {
      this.setEditRow(rowResult.index, this.innerValue[rowResult.index]);
    }
  }

  copyRow(rowResult: any) {
    rowResult.index = -1;
    this.innerValue.push({ ...rowResult.rowData, ...{ isNewRow: true } });
    this.updateTableValue();
    if (rowResult.createNewRow) {
      this.addRow();
    } else {
      this.setEditRow(this.innerValue.length - 1, JSON.parse(JSON.stringify(rowResult.rowData)));
    }
  }

  deleteRow(index: number) {
    if (index > -1) {
      this.innerValue.splice(index, 1);
      this.updateTableValue();
      if (this.innerValue.length) {
        const nextIndex = index == this.innerValue.length ? this.innerValue.length - 1 : index;
        this.setEditRow(nextIndex, this.innerValue[nextIndex]);
      } else {
        this.cancelRowEdit();
      }
    }
  }

  clearRow(index: number) {
    this.innerValue[index] = {};
    this.updateTableValue();
  }

  exportCSV() {
    // TODO: dynamic columnSeparator based on settings or language
    this.gridOptions.api.exportDataAsCsv({
      fileName: this._params.element.label,
      columnSeparator: ';'
    });
  }

  sizeToFit(overlay?: boolean) {
    if (overlay) {
      this.overlayGridOptions.api.sizeColumnsToFit();
    } else {
      this.gridOptions.api.sizeColumnsToFit();
    }
  }

  openDialog() {
    this.overlayGridOptions.api.refreshView();
    this.showDialog = true;
  }

  private validateTableData(): boolean {
    // todo: implement
    return true;
  }

  validate(c: FormControl) {
    return this.validateTableData()
      ? null
      : {
          table: {
            valid: false
          }
        };
  }

  onMouseDown($event: any) {
    if (this.overlayGridOptions.suppressRowClickSelection) {
      if (!this.pendingChanges.checkForPendingTasks(this.rowEdit.pendingTaskId)) {
        this.overlayGridOptions.suppressRowClickSelection = false;
        this.rowEdit.finishPending();
        let rowIndex = 1; //this.gridApi.getRowIndex($event.target, 'ag-body');
        if (rowIndex !== null) {
          this.overlayGridOptions.api.getRowNode('' + rowIndex).setSelected(true, true);
          $event.target.click();
        }
      } else {
        $event.preventDefault();
        $event.stopImmediatePropagation();
      }
    }
  }

  onCellClicked($event) {
    if ($event.rowIndex !== null) {
      if (!$event.node.group && $event.data) {
        if ($event.colDef.cellClass === 'router-link-cell') {
          // this.gridApi.openRouterLink($event.event, 'ag-row');
        }
      }
    }
  }
}
