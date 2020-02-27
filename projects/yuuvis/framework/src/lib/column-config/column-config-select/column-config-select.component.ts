import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ObjectType, ObjectTypeGroup, SystemService, TranslateService } from '@yuuvis/core';
import { ColumnConfigSelectItem } from '../column-config.interface';

@Component({
  selector: 'yuv-column-config-select',
  templateUrl: './column-config-select.component.html',
  styleUrls: ['./column-config-select.component.scss']
})
export class ColumnConfigSelectComponent implements OnInit {
  @Output() itemSelected = new EventEmitter<ColumnConfigSelectItem>();

  groups: ObjectTypeGroup[];
  selectedItem: string;

  constructor(private systemsService: SystemService, private translate: TranslateService) {}

  selectItem(type: ObjectType) {
    this.selectedItem = type.id;
    this.itemSelected.emit({
      id: type.id,
      label: type.label,
      type: type
    });
  }

  trackByFn(index, item) {
    return item.id;
  }

  ngOnInit() {
    this.groups = this.systemsService.getGroupedObjectTypes(true);
  }
}
