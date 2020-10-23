import { Component, HostBinding, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-test-responsive-tab-container',
  templateUrl: './test-responsive-tab-container.component.html',
  styleUrls: ['./test-responsive-tab-container.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestResponsiveTabContainerComponent implements OnInit {
  @HostBinding('class.styled') styled: boolean;

  constructor() {}

  ngOnInit() {}
}
