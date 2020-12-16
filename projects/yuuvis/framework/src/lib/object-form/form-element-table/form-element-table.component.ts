import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridOptions, Module } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { Component, forwardRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { PendingChangesService, SystemService } from '@yuuvis/core';
import { takeUntil } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { UnsubscribeOnDestroy } from '../../common/util/unsubscribe.component';
import { PopoverConfig } from '../../popover/popover.interface';
import { GridService } from '../../services/grid/grid.service';
import { addCircle, contentDownload, expand, sizeToFit } from '../../svg.generated';
import { ObjectFormOptions } from '../object-form.interface';
import { PopoverService } from './../../popover/popover.service';
import { RowEditComponent } from './row-edit/row-edit.component';

// data to be passed to the table component
export interface TableComponentParams {
  // current form situation (EDIT, SEARCH or CREATE)
  situation: string;
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

  @ViewChild('rowEdit') rowEdit: RowEditComponent;
  @ViewChild('overlay') overlay: TemplateRef<any>;

  @Input()
  set params(p: TableComponentParams) {
    if (p) {
      this._params = p;
      this.gridReady = false;
      this._elements = p.element.elements;
      this.gridOptions.columnDefs = this.createColumnDefinition();
      this.overlayGridOptions.columnDefs = this.createColumnDefinition();
      this.gridReady = true;
    }
  }
  get params() {
    return this._params;
  }

  private _params: TableComponentParams;
  private _elements: any[];
  gridReady = false;
  value: any[];
  innerValue: any[];
  gridOptions: GridOptions;
  overlayGridOptions: GridOptions;
  editingRow: EditRow;

  constructor(
    private systemService: SystemService,
    private pendingChanges: PendingChangesService,
    public gridApi: GridService,
    private popoverService: PopoverService,
    private iconRegistry: IconRegistryService
  ) {
    super();
    this.iconRegistry.registerIcons([expand, sizeToFit, contentDownload, addCircle]);
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

  propagateChange = (_: any) => {};

  writeValue(value: any[]): void {
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
    this.setEditRow(-1, {});
  }

  editRow(event) {
    this.setEditRow(event.node.id, event.node.data);
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
    this.openDialog();
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
    this.value = this.innerValue;
    this.propagateChange(this.value);
  }

  cancelRowEdit() {
    if (this.rowEdit) {
      this.rowEdit.finishPending();
    }
    this.editingRow = null;
  }

  openDialog() {
    const popoverConfig: PopoverConfig = {
      width: '95%',
      height: '95%',
      disableClose: true
    };
    if (!this.popoverService.hasActiveOverlay) {
      this.popoverService.open(this.overlay, popoverConfig);
    }
  }

  close(popover) {
    if (!this.rowEdit || !this.pendingChanges.checkForPendingTasks(this.rowEdit.pendingTaskId)) {
      popover.close();
      this.editingRow = null;
    }
  }

  updateRow(rowResult: any) {
    const isNewRow = rowResult.index === -1;
    if (isNewRow) {
      this.innerValue.push({ ...rowResult.rowData, ...{ isNewRow: true } });
    } else {
      this.innerValue[rowResult.index] = rowResult.rowData;
    }
    this.updateTableValue();
    if (isNewRow && !rowResult.createNewRow) {
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

  exportCSV() {
    // TODO: dynamic columnSeparator based on settings or language
    this.gridOptions.api.exportDataAsCsv({
      fileName: this._params.element.label,
      columnSeparator: ';'
    });
  }

  sizeToFit(overlay?: boolean) {
    this.gridOptions.api.sizeColumnsToFit();
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
        let rowIndex = this.getRowIndex($event.target, 'ag-body');
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

  private getRowIndex(el, parentClass: string) {
    return el && !el.classList.contains(parentClass)
      ? el.getAttribute('row-index')
        ? parseInt(el.getAttribute('row-index'), 10)
        : this.getRowIndex(el.parentElement, parentClass)
      : null;
  }
}
