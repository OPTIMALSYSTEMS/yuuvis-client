import { Component, OnInit } from '@angular/core';
import { Selectable } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-object-picker',
  templateUrl: './test-object-picker.component.html',
  styleUrls: ['./test-object-picker.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestObjectPickerComponent implements OnInit {
  constructor() {}
  selected: Selectable;
  skipTypes = ['appPersonalfile:pfpersonalfile'];

  objectSelect(e: Selectable) {
    console.log(e);
    this.selected = e;
  }

  ngOnInit(): void {}
}
