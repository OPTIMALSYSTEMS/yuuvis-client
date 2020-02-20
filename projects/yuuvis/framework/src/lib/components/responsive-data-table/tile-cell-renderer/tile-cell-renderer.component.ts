import { AgRendererComponent } from '@ag-grid-community/angular';
import { Component } from '@angular/core';
import { BaseObjectTypeField, SecondaryObjectTypeField, SystemService } from '@yuuvis/core';

@Component({
  selector: 'yuv-tile-cell-renderer',
  templateUrl: './tile-cell-renderer.component.html',
  styleUrls: ['./tile-cell-renderer.component.scss']
})
export class TileCellRendererComponent implements AgRendererComponent {
  private params: any;
  data: any;

  constructor(private systemService: SystemService) {}

  refresh(params: any) {
    return false;
  }

  agInit(params: any): void {
    const { data } = (this.params = params);
    const objectTypeId = data[BaseObjectTypeField.OBJECT_TYPE_ID];
    this.data = {
      title: data[SecondaryObjectTypeField.TITLE],
      description: data[SecondaryObjectTypeField.DESCRIPTION],
      objectId: data[BaseObjectTypeField.OBJECT_ID],
      objectTypeId,
      objectTypeIcon: this.systemService.getObjectTypeIcon(objectTypeId),
      objectTypeLabel: this.systemService.getLocalizedResource(`${objectTypeId}_label`),
      date: data[BaseObjectTypeField.MODIFICATION_DATE]
    };
  }
}
