import { Component } from '@angular/core';
import { DmsObject, DmsService, SystemType } from '@yuuvis/core';
import { ReferenceEntry } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-context',
  templateUrl: './test-context.component.html',
  styleUrls: ['./test-context.component.scss']
})
export class TestContextComponent {
  contextObject: DmsObject;
  allowedTypes = [SystemType.FOLDER];

  constructor(private dmsService: DmsService) {}

  onObjectSelect(result: ReferenceEntry) {
    if (result) {
      this.dmsService.getDmsObject(result.id).subscribe((o) => (this.contextObject = o));
    } else {
      this.contextObject = null;
    }
  }
}
