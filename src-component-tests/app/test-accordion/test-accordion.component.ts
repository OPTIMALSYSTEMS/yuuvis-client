import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-test-accordion',
  templateUrl: './test-accordion.component.html',
  styleUrls: ['./test-accordion.component.scss']
})
export class TestAccordionComponent implements OnInit {
  constructor() {}

  openChanged(event) {
    console.log(event);
  }

  ngOnInit() {}
}
