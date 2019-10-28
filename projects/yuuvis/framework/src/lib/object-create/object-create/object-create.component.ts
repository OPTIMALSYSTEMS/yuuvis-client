import { Component } from '@angular/core';

@Component({
  selector: 'yuv-object-create',
  templateUrl: './object-create.component.html',
  styleUrls: ['./object-create.component.scss']
})
export class ObjectCreateComponent {
  // state of creation progress
  completed = {
    type: false,
    file: false,
    indexdata: false
  };

  constructor() {}
}
