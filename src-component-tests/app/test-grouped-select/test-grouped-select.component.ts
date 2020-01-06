import { Component, OnInit } from '@angular/core';
import { Selectable, SelectableGroup } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-grouped-select',
  templateUrl: './test-grouped-select.component.html',
  styleUrls: ['./test-grouped-select.component.scss']
})
export class TestGroupedSelectComponent implements OnInit {
  groups: SelectableGroup[] = [];

  constructor() {}

  // onSelect(selected: Selectable | Selectable[]) {
  //   console.log(selected);
  // }

  onSelectionChange(selected: Selectable[]) {
    console.log(selected);
  }

  ngOnInit() {
    const gc = 5;
    const ic = 10;

    for (let i = 0; i < gc; i++) {
      const g: SelectableGroup = {
        label: `group_${i}`,
        items: []
      };

      for (let j = 0; j < ic; j++) {
        g.items.push({
          label: `item_${i}_${j}`
        });
      }
      this.groups.push(g);
    }
  }
}
