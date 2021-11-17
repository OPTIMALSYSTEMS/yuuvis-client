import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-test-form-elements',
  templateUrl: './test-form-elements.component.html',
  styleUrls: ['./test-form-elements.component.scss']
})
export class TestFormElementsComponent implements OnInit {
  cbIndeterminate: boolean = null;

  constructor() {}

  checkboxChanged(e: any) {
    console.log(e);
  }

  ngOnInit(): void {}
}
