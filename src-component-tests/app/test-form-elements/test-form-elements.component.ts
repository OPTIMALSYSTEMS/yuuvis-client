import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'yuv-test-form-elements',
  templateUrl: './test-form-elements.component.html',
  styleUrls: ['./test-form-elements.component.scss']
})
export class TestFormElementsComponent implements OnInit {
  cbIndeterminate: boolean = null;
  datetime = {
    default: null,
    withTime: null
  };

  datePickerForm = this.fb.group({
    default: [],
    widthTime: [],
    futureOnly: []
  });

  constructor(private fb: FormBuilder) {}

  checkboxChanged(e: any) {
    console.log(e);
  }

  ngOnInit(): void {}
}
