import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DmsObject, DmsService } from '@yuuvis/core';
import { PopoverRef, PopoverService, QuickfinderEntry } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-quickfinder',
  templateUrl: './test-quickfinder.component.html',
  styleUrls: ['./test-quickfinder.component.scss']
})
export class TestQuickfinderComponent implements OnInit {
  @ViewChild('tplContextPicker') tplContextPicker: TemplateRef<any>;
  selectedObject: DmsObject;

  constructor(private popoverService: PopoverService, private dmsService: DmsService) {}

  onPickerResult(result: QuickfinderEntry, popoverRef?: PopoverRef) {
    console.log('Picker result', result);
    this.dmsService.getDmsObject(result.id).subscribe((o) => (this.selectedObject = o));
    if (popoverRef) {
      popoverRef.close();
    }
  }

  ngOnInit(): void {}
}
