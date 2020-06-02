import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DmsObject, DmsService } from '@yuuvis/core';
import { PopoverRef, PopoverService, ReferenceEntry } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-quickfinder',
  templateUrl: './test-quickfinder.component.html',
  styleUrls: ['./test-quickfinder.component.scss']
})
export class TestQuickfinderComponent implements OnInit {
  @ViewChild('tplContextPicker') tplContextPicker: TemplateRef<any>;
  selectedObjects: DmsObject[];

  constructor(private popoverService: PopoverService, private dmsService: DmsService) {}

  onPickerResult(result: ReferenceEntry[], popoverRef?: PopoverRef) {
    console.log('Picker result', result);
    this.dmsService.getDmsObjects(result.map((i) => i.id)).subscribe((o) => (this.selectedObjects = o));
  }

  ngOnInit(): void {}
}
