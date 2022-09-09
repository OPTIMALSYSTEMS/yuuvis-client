import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridOptions, Module } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { Component, forwardRef, HostListener, Input, NgZone, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { Classification, PendingChangesService, SystemService } from '@yuuvis/core';
import { takeUntil } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { UnsubscribeOnDestroy } from '../../common/util/unsubscribe.component';
import { PopoverConfig } from '../../popover/popover.interface';
import { GridService } from '../../services/grid/grid.service';
import { addCircle, contentDownload, expand, sizeToFit } from '../../svg.generated';
import { PopoverService } from './../../popover/popover.service';
import { EditRow, TableComponentParams } from './form-element-table.interface';
import { RowEditComponent } from './row-edit/row-edit.component';

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
      this._elements = p.element?.elements || [];

      this.gridOptions.columnDefs = this.createColumnDefinition(p.element?.classifications?.includes(Classification.TABLE_SORTABLE));
      this.overlayGridOptions.columnDefs = this.createColumnDefinition();

      this.disableOptions = this.gridOptions.columnDefs.length === 0;
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
  disableOptions: boolean;

  private onRowDragEnd = (e) => {
    const v = [];
    this.gridOptions.api.forEachNode((rowNode, index) => {
      v.push(rowNode.data);
    });
    this.innerValue = v;
    this.updateTableValueAndRunChangeDetection();
  };

  @HostListener('keydown.control.alt.shift.c', ['$event'])
  @HostListener('keydown.control.shift.c', ['$event'])
  @HostListener('keydown.control.alt.c', ['$event'])
  @HostListener('keydown.control.c', ['$event'])
  @HostListener('keydown.meta.alt.shift.c', ['$event'])
  @HostListener('keydown.meta.shift.c', ['$event'])
  @HostListener('keydown.meta.alt.c', ['$event'])
  @HostListener('keydown.meta.c', ['$event'])
  copyCellHandler(event: KeyboardEvent) {
    this.gridApi.copyToClipboard(event, this.gridOptions);
  }

  constructor(
    private ngZone: NgZone,
    private pendingChanges: PendingChangesService,
    public gridApi: GridService,
    private popoverService: PopoverService,
    private iconRegistry: IconRegistryService,
    private systemService: SystemService
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
      suppressCellFocus: false,
      rowSelection: 'single',
      suppressMovableColumns: true,
      suppressNoRowsOverlay: true,
      suppressLoadingOverlay: true,
      suppressContextMenu: true,
      rowDragManaged: true,
      animateRows: true,
      onRowDragEnd: this.onRowDragEnd
    };
    this.gridOptions.context.tableComponent = this;

    this.overlayGridOptions = <GridOptions>{
      context: {},
      headerHeight: 30,
      rowHeight: 30,
      rowBuffer: 20,
      multiSortKey: 'ctrl',
      accentedSort: true,
      suppressCellFocus: false,
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
  private createColumnDefinition(dragEnabled?: boolean): ColDef[] {
    const hasElements = Array.isArray(this._elements);
    return hasElements
      ? this._elements.map((el, i) => {
          let col: ColDef = this.gridApi.getColumnDefinition(el);
          if (el.labelkey) {
            el.label = this.systemService.getLocalizedResource(`${el.labelkey}_label`) || el.labelkey;
          }

          Object.assign(col, {
            rowDrag: dragEnabled && i === 0,
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
        })
      : [];
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

  private updateTableValueAndRunChangeDetection() {
    this.ngZone.run(() => {
      this.updateTableValue();
    });
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
    this.gridOptions.api.exportDataAsCsv({
      ...this.gridApi.csvExportParams,
      fileName: this._params.element.label
    });
  }

  sizeToFit(overlay?: boolean) {
    this.gridOptions.api.sizeColumnsToFit();
  }

  private validateTableData(): boolean {
    // todo: implement
    return true;
  }

  validate(c: UntypedFormControl) {
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
