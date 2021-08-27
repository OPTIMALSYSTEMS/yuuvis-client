import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-test-object-picker',
  templateUrl: './test-object-picker.component.html',
  styleUrls: ['./test-object-picker.component.scss']
})
export class TestObjectPickerComponent implements OnInit {
  constructor() {}

  objectSelect(e) {
    console.log(e);
  }

  ngOnInit(): void {}
}
