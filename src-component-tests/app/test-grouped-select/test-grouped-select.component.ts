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
      id: 'tiere',
      label: 'Tiere',
      items: [
        { id: '1', label: 'Hund' },
        { id: '2', label: 'Katze' },
        { id: '3', label: 'Maus' }
      ]
    },
    {
      id: 'pflanzen',
      label: 'Pflanzen',
      items: [
        { id: '4', label: 'Baum' },
        { id: '5', label: 'Farn' },
        { id: '6', label: 'Brennessel' },
        { id: '7', label: 'Blume' }
      ]
    }
  ];
  selectedItems: Selectable[] = [
    { id: '0_0', label: 'item_0_0' },
    { id: '0_1', label: 'item_0_1' },
    { id: '0_2', label: 'item_0_2' },
    { id: '1_2', label: 'item_1_2' },
    { id: '1_5', label: 'item_1_5' },
    { id: '1_4', label: 'item_1_4' },
    { id: '1_9', label: 'item_1_9' },
    { id: '1_8', label: 'item_1_8' },
    { id: '2_6', label: 'item_2_6' }
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
        id: `${i}`,
        label: `group_${i}`,
        items: []
      };

      for (let j = 0; j < ic; j++) {
        g.items.push({
          id: `${i}_${j}`,
          label: `item_${i}_${j}`
        });
      }
      this.groups.push(g);
    }
  }
}
