import { Component, OnInit } from '@angular/core';
import { Selectable, SelectableGroup } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-grouped-select',
  templateUrl: './test-grouped-select.component.html',
  styleUrls: ['./test-grouped-select.component.scss']
})
export class TestGroupedSelectComponent implements OnInit {
  groups: SelectableGroup[] = [];
  groups2: SelectableGroup[] = [
    {
      label: 'Tiere',
      items: [{ label: 'Hund' }, { label: 'Katze' }, { label: 'Maus' }]
    },
    {
      label: 'Pflanzen',
      items: [{ label: 'Baum' }, { label: 'Farn' }, { label: 'Brennessel' }, { label: 'Blume' }]
    }
  ];
  selectedItems: Selectable[] = [
    { label: 'item_0_0' },
    { label: 'item_0_1' },
    { label: 'item_0_2' },
    { label: 'item_1_2' },
    { label: 'item_1_5' },
    { label: 'item_1_4' },
    { label: 'item_1_9' },
    { label: 'item_1_8' },
    { label: 'item_2_6' }
  ];
  selectedItems2: Selectable[] = [];

  constructor() {}

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
