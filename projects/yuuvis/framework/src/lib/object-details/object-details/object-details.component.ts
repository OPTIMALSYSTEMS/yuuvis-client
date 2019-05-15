import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'yuv-object-details',
  templateUrl: './object-details.component.html',
  styleUrls: ['./object-details.component.scss']
})
export class ObjectDetailsComponent implements OnInit {

  @Input() dmsObject: any;

  constructor() { }

  ngOnInit() {
  }

}
