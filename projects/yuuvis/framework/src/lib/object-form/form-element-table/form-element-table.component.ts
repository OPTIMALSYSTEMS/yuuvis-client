import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridOptions, Module } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { Component, HostListener, Input, NgZone, TemplateRef, ViewChild, forwardRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, UntypedFormControl, Validator } from '@angular/forms';
import { Classification, PendingChangesService, SystemService } from '@yuuvis/core';
import { debounceTime } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { PopoverConfig } from '../../popover/popover.interface';
import { GridService } from '../../services/grid/grid.service';
import { addCircle, contentDownload, expand, sizeToFit } from '../../svg.generated';
import { PopoverService } from './../../popover/popover.service';
import { ExpandedTableComponent } from './expanded-table/expanded-table.component';
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
export class FormElementTableComponent implements ControlValueAccessor, Validator {
  public modules: Module[] = [ClientSideRowModelModule, CsvExportModule];

  @ViewChild('agGrid') agGrid!: AgGridAngular;
  @ViewChild('overlayTable') overlayTable!: ExpandedTableComponent;
  @ViewChild('rowEdit') rowEdit: RowEditComponent;
  @ViewChild('overlay') overlay: TemplateRef<any>;

  get overlayGrid(): AgGridAngular {
    return this.overlayTable?.overlayGrid;
  }

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
    this.agGrid?.api.forEachNode((rowNode, index) => {
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
    this.gridApi.copyToClipboard(event, this.agGrid, this.gridOptions);
  }

  constructor(
    private ngZone: NgZone,
    private pendingChanges: PendingChangesService,
    public gridApi: GridService,
    private popoverService: PopoverService,
    private iconRegistry: IconRegistryService,
    private systemService: SystemService
  ) {
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

    this.pendingChanges.tasks$.pipe(debounceTime(10), takeUntilDestroyed()).subscribe((tasks) => {
      const s = this.overlayGridOptions.suppressRowClickSelection = !!this.rowEdit && !!tasks.find((task) => task.id === this.rowEdit.pendingTaskId);
      this.overlayGrid?.api.updateGridOptions({ suppressRowClickSelection: s, suppressCellFocus: s });
    });
  }

  propagateChange = (_: any) => { };

  writeValue(value: any[]): void {
    this.value = value instanceof Array ? value : [];
    // create a clone of the actual value for internal usage
    this.innerValue = JSON.parse(JSON.stringify(this.value));

    if (this.agGrid?.api) {
      this.agGrid.api.setGridOption('rowData', this.innerValue);
    } else {
      this.gridOptions.rowData = this.innerValue;
    }

    if (this.overlayGrid?.api) {
      this.overlayGrid.api.setGridOption('rowData', this.innerValue);
      setTimeout(() => this.selectEditRow(), 0);
    } else {
      this.overlayGridOptions.rowData = this.innerValue;
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }

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
    if (this.overlayGrid?.api) {
      this.overlayGrid?.api.deselectAll();
      if (this.editingRow.index !== -1) {
        let rowNode = this.overlayGrid?.api.getRowNode('' + this.editingRow.index);
        rowNode.setSelected(true, true);
        this.overlayGrid?.api.ensureNodeVisible(rowNode);
      }
    }
  }

  private updateTableValueAndRunChangeDetection() {
    this.ngZone.run(() => {
      this.updateTableValue();
    });
  }

  private updateTableValue() {
    this.agGrid.api.updateGridOptions({ rowData: this.innerValue });
    if (this.overlayGrid?.api) {
      this.overlayGrid.api.updateGridOptions({ rowData: this.innerValue });
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
      let rowNode = this.overlayGrid.api.getRowNode('' + (this.innerValue.length - 1));
      this.overlayGrid.api.ensureNodeVisible(rowNode);
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
    this.agGrid.api.exportDataAsCsv({
      ...this.gridApi.csvExportParams,
      fileName: this._params.element.label
    });
  }

  sizeToFit(overlay?: boolean) {
    this.agGrid.api.sizeColumnsToFit();
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
    if ($event.button === 0 && this.overlayGrid?.api.getGridOption('suppressRowClickSelection')) {
      if (!this.pendingChanges.checkForPendingTasks(this.rowEdit.pendingTaskId)) {
        this.overlayGrid?.api.updateGridOptions({ suppressRowClickSelection: false, suppressCellFocus: false });
        this.rowEdit.finishPending();
        this.selectEvent($event);
      } else {
        $event.preventDefault();
        $event.stopImmediatePropagation();
      }
    }
  }

  private selectEvent($event: MouseEvent | any) {
    const colId = $event.composedPath?.().find((el) => el?.getAttribute('col-id'))?.getAttribute('col-id');
    const rowId = $event.composedPath?.().find((el) => el?.getAttribute('row-id'))?.getAttribute('row-id');
    if (colId) {
      const row = this.overlayGrid.api.getRowNode(rowId);
      row.setSelected(true, true);
      this.overlayGrid.api.setFocusedCell(row.rowIndex, colId);
    }
  }
}
