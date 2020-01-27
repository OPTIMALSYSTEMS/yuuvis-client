import { Component, OnInit } from '@angular/core';
import { Selectable, SelectableGroup } from '@yuuvis/framework';
import * as faker from 'faker';
import { DATA_GROUPS, DATA_GROUPS_FULL } from './test-grouped-select.data';

@Component({
  selector: 'yuv-test-grouped-select',
  templateUrl: './test-grouped-select.component.html',
  styleUrls: ['./test-grouped-select.component.scss']
})
export class TestGroupedSelectComponent implements OnInit {
  view: string = 'default';
  multiselect: boolean = true;
  selectionRes: any;
  selectionChangedRes: any;
  groups: SelectableGroup[] = [];
  selectedItems: Selectable[] = [];

  constructor() {}

  setGroupData(full?: boolean) {
    this.selectedItems = [];
    this.groups = full ? DATA_GROUPS_FULL : DATA_GROUPS;
  }

  onSelectionChange(selected: Selectable[]) {
    this.selectionChangedRes = selected;
  }

  onSelect(selection: Selectable[]) {
    this.selectionRes = JSON.stringify(selection, null, 2);
  }

  setSelection() {
    this.selectedItems = [this.groups[0].items[1], this.groups[0].items[2], this.groups[1].items[0]];
  }

  clearSelection() {
    this.selectedItems = [];
  }

  setRandomGroupData(full?: boolean) {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>';
    const x = [10, 4, 6, 8, 2, 12, 4, 8];
    const groups = [];
    for (let i = 0; i < x.length; i++) {
      const g: SelectableGroup = {
        id: `${i}`,
        label: `${i} - ${faker.commerce.department()}`,
        items: []
      };

      for (let j = 0; j < x[i]; j++) {
        g.items.push(
          full
            ? {
                id: `${i}_${j}`,
                label: `${faker.commerce.product()}`,
                description: `${faker.commerce.productName()}`,
                svg: svg,
                highlight: i === 0 && j === 1
              }
            : {
                id: `${i}_${j}`,
                label: `${faker.commerce.product()}`
              }
        );
      }
      groups.push(g);
    }
    this.groups = groups;
  }

  ngOnInit() {
    this.setGroupData();
  }
}
