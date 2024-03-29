import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridOptions, Module } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { GridService } from '../../../services/grid/grid.service';
import { addCircle, contentDownload, sizeToFit } from '../../../svg.generated';
import { TableComponentParams } from '../form-element-table.interface';

@Component({
  selector: 'yuv-expanded-table',
  templateUrl: './expanded-table.component.html',
  styleUrls: ['./expanded-table.component.scss']
})
export class ExpandedTableComponent {
  public modules: Module[] = [ClientSideRowModelModule, CsvExportModule];

  @Input() overlayGridOptions: GridOptions;
  @Input() params: TableComponentParams;

  @Output() onMouseDown: EventEmitter<any> = new EventEmitter();
  @Output() onCellClicked: EventEmitter<any> = new EventEmitter();
  @Output() onAddRowButtonClicked: EventEmitter<any> = new EventEmitter();

  @HostListener('keydown.control.alt.shift.c', ['$event'])
  @HostListener('keydown.control.shift.c', ['$event'])
  @HostListener('keydown.control.alt.c', ['$event'])
  @HostListener('keydown.control.c', ['$event'])
  @HostListener('keydown.meta.alt.shift.c', ['$event'])
  @HostListener('keydown.meta.shift.c', ['$event'])
  @HostListener('keydown.meta.alt.c', ['$event'])
  @HostListener('keydown.meta.c', ['$event'])
  copyCellHandler(event: KeyboardEvent) {
    this.gridApi.copyToClipboard(event, this.overlayGridOptions);
  }

  constructor(public gridApi: GridService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([sizeToFit, contentDownload, addCircle]);
  }

  exportCSV() {
    this.overlayGridOptions.api.exportDataAsCsv({
      ...this.gridApi.csvExportParams,
      fileName: this.params.element.label
    });
  }

  sizeToFit() {
    this.overlayGridOptions.api.sizeColumnsToFit();
  }
}
