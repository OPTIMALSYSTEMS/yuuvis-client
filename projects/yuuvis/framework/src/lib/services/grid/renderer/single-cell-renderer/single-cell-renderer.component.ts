import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';
import { BaseObjectTypeField, SystemService } from '@yuuvis/core';
import { LocaleDatePipe } from '../../../../pipes/locale-date.pipe';

@Component({
  selector: 'yuv-single-cell-renderer',
  templateUrl: './single-cell-renderer.component.html',
  styleUrls: ['./single-cell-renderer.component.scss'],
  providers: [LocaleDatePipe]
})
export class SingleCellRendererComponent implements ICellRendererAngularComp {
  params: any;
  version: any;
  modified: any;
  title: string;
  description: string;
  objectTypeId: string;

  constructor(private systemService: SystemService, private datePipe: LocaleDatePipe) {}

  refresh(params: any): boolean {
    this.params = params;
    this.objectTypeId = this.systemService.getLeadingObjectTypeID(
      params.data[BaseObjectTypeField.OBJECT_TYPE_ID],
      params.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]
    );
    this.version = params.data[BaseObjectTypeField.VERSION_NUMBER];
    this.modified = this.datePipe.transform(params.data[BaseObjectTypeField.MODIFICATION_DATE]);
    // this.modified = this.datePipe.transform(params.data[this.data.dateField || BaseObjectTypeField.MODIFICATION_DATE]);
    this.title = this.systemService.getLocalizedResource(`${this.objectTypeId}_label`);
    return true;
  }

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }
}
