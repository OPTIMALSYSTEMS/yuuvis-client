import { Component, Input } from '@angular/core';
import { ObjectFormControlWrapper } from '../object-form.interface';

@Component({
  selector: 'yuv-object-form-element',
  templateUrl: './object-form-element.component.html',
  styleUrls: ['./object-form-element.component.scss']
})
export class ObjectFormElementComponent {
  formElementRef: any;
  element: ObjectFormControlWrapper;
  errors: string[];

  @Input() situation: string;

  // element is supposed to be a special FormGroup holding a single form element
  @Input('element')
  set elementSetter(el: ObjectFormControlWrapper) {
    if (el) {
      this.element = el;
      this.formElementRef = el.controls[el._eoFormControlWrapper.controlName];
    }
  }

  constructor() {
    // setup error messages for the different types of errors that may appear
  }
}
