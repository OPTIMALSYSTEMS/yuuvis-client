import { Component, OnInit } from '@angular/core';
import { Selectable, SelectableGroup } from '@yuuvis/framework';
import * as faker from 'faker';

@Component({
  selector: 'yuv-test-grouped-select',
  templateUrl: './test-grouped-select.component.html',
  styleUrls: ['./test-grouped-select.component.scss']
})
export class TestGroupedSelectComponent implements OnInit {
  view: string = 'm';
  selectionRes: any;
  selectionChangedRes: any;
  groups: SelectableGroup[] = [];
  selectedItems: Selectable[] = [];

  constructor() {}

  onSelectionChange(selected: Selectable[]) {
    this.selectionChangedRes = selected;
  }

  onSelect(selection: Selectable[]) {
    this.selectionRes = JSON.stringify(selection, null, 2);
  }

  setSelectedItems() {
    this.selectedItems = [this.groups[0].items[1], this.groups[0].items[2], this.groups[1].items[0]];
  }

  ngOnInit() {
    const x = [10, 4, 6, 8, 2, 12, 4, 8];

    for (let i = 0; i < x.length; i++) {
      const g: SelectableGroup = {
        id: `${i}`,
        label: `${i} - ${faker.commerce.department()}`,
        items: []
      };

      for (let j = 0; j < x[i]; j++) {
        g.items.push({
          id: `${i}_${j}`,
          label: `${faker.commerce.product()}`
        });
      }
      this.groups.push(g);
    }
  }
}
