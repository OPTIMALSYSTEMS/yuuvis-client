import { Component, OnInit } from '@angular/core';
import { DmsObject, DmsService } from '@yuuvis/core';
import { ReferenceEntry } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-quickfinder',
  templateUrl: './test-quickfinder.component.html',
  styleUrls: ['./test-quickfinder.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestQuickfinderComponent implements OnInit {
  selectedObject: DmsObject;

  constructor(private dmsService: DmsService) {}

  onPickerResult(result: ReferenceEntry) {
    if (result) {
      this.dmsService.getDmsObject(result.id).subscribe((o) => (this.selectedObject = o));
    } else {
      this.selectedObject = null;
    }
  }

  ngOnInit(): void {}
}
