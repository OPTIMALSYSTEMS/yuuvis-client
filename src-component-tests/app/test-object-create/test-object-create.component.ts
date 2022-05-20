import { Component, OnInit } from '@angular/core';
import { DmsObject, SystemService } from '@yuuvis/core';
import { ObjectTypePreset } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-object-create',
  templateUrl: './test-object-create.component.html',
  styleUrls: ['./test-object-create.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestObjectCreateComponent implements OnInit {
  contextId: string;
  objectTypePreset: ObjectTypePreset = {
    objectType: this.system.getObjectType('appPersonalfile:pfpersonalfile'),
    data: {
      'appClient:clienttitle': 'Employee of the month',
      'appClient:clientdescription': 'Anni Lusia Schulz',
      'appPersonalfile:pffirstname': ['Anni', 'Luisa'],
      'appPersonalfile:pfname': 'Schulz'
    }
  };
  objectTypePresetContext = 'd50256d1-6502-40c4-b8da-626793d5ab12';
  objectTypePresetForContext: ObjectTypePreset = {
    objectType: this.system.getObjectType('appClient:minidoc'),
    data: {
      'appClient:clienttitle': 'Mini doc title preset',
      'appClient:clientdescription': 'Mini doc description preset'
    }
  };

  constructor(private system: SystemService) {}

  setContext(o: DmsObject) {
    this.contextId = o ? o.id : null;
  }

  onContextRemoved() {
    alert('Context removed');
    this.contextId = null;
  }

  ngOnInit() {}
}
