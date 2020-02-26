import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ObjectType, SystemService, TranslateService, Utils } from '@yuuvis/core';
import { ColumnConfigSelectItem } from '../column-config.interface';

@Component({
  selector: 'yuv-column-config-select',
  templateUrl: './column-config-select.component.html',
  styleUrls: ['./column-config-select.component.scss']
})
export class ColumnConfigSelectComponent implements OnInit {
  @Output() itemSelected = new EventEmitter<ColumnConfigSelectItem>();

  configSelectItems: ColumnConfigSelectItem[] = [];
  // groups: any[];
  selectedItem: string;

  constructor(private systemsService: SystemService, private translate: TranslateService) {}

  selectItem(item: ColumnConfigSelectItem) {
    this.selectedItem = item.id;
    this.itemSelected.emit(item);
  }

  trackByFn(index, item) {
    return item.id;
  }

  ngOnInit() {
    // this.groups = this.systemsService.getGroupedObjectTypes().map(g => ({
    //   label: g.label,
    //   types: g.types.map(t => ({
    //     id: t.id,
    //     label: this.systemsService.getLocalizedResource(`${t.id}_label`),
    //     type: t
    //   }))
    // }));

    this.configSelectItems = [
      {
        id: 'mixed',
        label: this.translate.instant('yuv.framework.column-config.title.mixed'),
        type: null
      },
      ...this.systemsService
        .getObjectTypes()
        .map((t: ObjectType) => ({
          id: Utils.uuid(),
          label: this.systemsService.getLocalizedResource(`${t.id}_label`),
          type: t
        }))
        .sort(Utils.sortValues('label'))
    ];
  }
}
