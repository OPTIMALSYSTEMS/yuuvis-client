import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ObjectType, ObjectTypeGroup, SystemService, TranslateService } from '@yuuvis/core';

/**
 * This component is for picking an object type.
 *
 * @example
 *  <yuv-column-config-select (itemSelected)="setColumnConfigInputFromSelect($event)"></yuv-column-config-select>
 */
@Component({
  selector: 'yuv-column-config-select',
  templateUrl: './column-config-select.component.html',
  styleUrls: ['./column-config-select.component.scss']
})
export class ColumnConfigSelectComponent implements OnInit {
  /** Emits the object type that has been selected */
  @Output() itemSelected = new EventEmitter<ObjectType>();

  mixed: ObjectType;
  groups: ObjectTypeGroup[];
  selectedItem: string;

  constructor(private systemsService: SystemService, private translate: TranslateService) {}

  selectItem(type: ObjectType) {
    this.selectedItem = type.id;
    this.itemSelected.emit(type);
  }

  trackByFn(index, item) {
    return item.id;
  }

  ngOnInit() {
    this.groups = this.systemsService.getGroupedObjectTypes(true, true);
    this.mixed = this.systemsService.getBaseType();
  }
}
