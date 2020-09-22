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

  viewMode: string;

  cell: {
    icon: string;
    version: any;
    modified: any;
    title: string;
    description: string;
    objectTypeId: string;
  };

  constructor(private systemService: SystemService, private datePipe: LocaleDatePipe) {}

  refresh(params: any): boolean {
    this.params = params;
    this.viewMode = params._crParams.viewMode;
    const objectTypeId = this.systemService.getLeadingObjectTypeID(
      params.data[BaseObjectTypeField.OBJECT_TYPE_ID],
      params.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]
    );

    this.cell = {
      objectTypeId,
      icon: params.data.icon,
      version: params.data[BaseObjectTypeField.VERSION_NUMBER],
      modified: this.datePipe.transform(params.data[params._crParams.dateField || BaseObjectTypeField.MODIFICATION_DATE]),
      title: (params._crParams.titleField ? params.data[params._crParams.titleField] : this.systemService.getLocalizedResource(`${objectTypeId}_label`)) || '',
      description: params.data[params._crParams.descriptionField] || ''
    };
    return true;
  }

  agInit(params: ICellRendererParams): void {
    this.refresh(params);
  }
}
