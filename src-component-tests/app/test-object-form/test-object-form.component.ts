import { Component, OnInit } from '@angular/core';
import { formMultiModel } from './data/form.multi';
import { formSingleModel } from './data/form.single';

@Component({
  selector: 'yuv-test-object-form',
  templateUrl: './test-object-form.component.html',
  styleUrls: ['./test-object-form.component.scss']
})
export class TestObjectFormComponent implements OnInit {
  formSingleOptions = {
    formModel: formSingleModel,
    data: {}
  };
  formMultiOptions = {
    formModel: formMultiModel,
    data: {}
  };

  constructor() {}

  ngOnInit() {}
}
