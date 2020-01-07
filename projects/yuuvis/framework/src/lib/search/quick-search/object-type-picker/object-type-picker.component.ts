import { Component, OnInit } from '@angular/core';
import { SystemService, Utils } from '@yuuvis/core';
import { SelectableGroup } from './../../../grouped-select/grouped-select/grouped-select.interface';

@Component({
  selector: 'yuv-object-type-picker',
  templateUrl: './object-type-picker.component.html',
  styleUrls: ['./object-type-picker.component.scss']
})
export class ObjectTypePickerComponent implements OnInit {
  // object types that one should not search for
  // private skipTypes = [SystemType.DOCUMENT, SystemType.FOLDER];
  private skipTypes = [];
  availableObjectTypes: SelectableGroup[];

  constructor(private systemService: SystemService) {
    this.systemService.system$.subscribe(_ => {
      const types = this.systemService
        .getObjectTypes()
        .filter(t => !this.skipTypes.includes(t.id))
        .map(ot => ({
          // id: ot.id,
          label: this.systemService.getLocalizedResource(`${ot.id}_label`),
          value: ot.id
        }))
        .sort(Utils.sortValues('label'));
      this.availableObjectTypes = [
        {
          label: '...',
          items: types
        }
      ];
      // this.onObjectTypesSelected([], false);
    });
  }

  ngOnInit() {}
}
