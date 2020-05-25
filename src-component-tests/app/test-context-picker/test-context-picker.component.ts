import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { DmsObject, DmsService } from '@yuuvis/core';
import { PopoverConfig, PopoverRef, PopoverService } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-context-picker',
  templateUrl: './test-context-picker.component.html',
  styleUrls: ['./test-context-picker.component.scss']
})
export class TestContextPickerComponent implements OnInit {
  @ViewChild('tplContextPicker') tplContextPicker: TemplateRef<any>;
  selectedObject: DmsObject;

  constructor(private popoverService: PopoverService, private dmsService: DmsService) {}

  showContextPicker() {
    const popoverConfig: PopoverConfig = {
      maxHeight: '70%'
    };
    this.popoverService.open(this.tplContextPicker, popoverConfig);
  }

  onPickerResult(contextId: string, popoverRef?: PopoverRef) {
    console.log('Got context ID', contextId);
    this.dmsService.getDmsObject(contextId).subscribe((o) => (this.selectedObject = o));
    if (popoverRef) {
      popoverRef.close();
    }
  }

  onPickerCancel(popoverRef?: PopoverRef) {
    if (popoverRef) {
      popoverRef.close();
    }
  }

  ngOnInit(): void {}
}
