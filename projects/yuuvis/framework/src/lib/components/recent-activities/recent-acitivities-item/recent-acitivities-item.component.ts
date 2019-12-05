import { AgRendererComponent } from '@ag-grid-community/angular';
import { Component, Input } from '@angular/core';
import { BaseObjectTypeField, SecondaryObjectTypeField, SystemService } from '@yuuvis/core';
import { RecentItem } from './../recent-activities.component';

@Component({
  selector: 'yuv-recent-acitivities-item',
  templateUrl: './recent-acitivities-item.component.html',
  styleUrls: ['./recent-acitivities-item.component.scss']
})
export class RecentAcitivitiesItemComponent implements AgRendererComponent {
  @Input() recentItem: RecentItem;
  private params: any;

  constructor(private systemService: SystemService) {}

  refresh(params: any) {
    return false;
  }

  agInit(params: any): void {
    const { data } = (this.params = params);
    const objectTypeId = data[BaseObjectTypeField.OBJECT_TYPE_ID];
    this.recentItem = {
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
