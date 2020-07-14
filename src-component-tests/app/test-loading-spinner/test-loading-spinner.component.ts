import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-test-loading-spinner',
  templateUrl: './test-loading-spinner.component.html',
  styleUrls: ['./test-loading-spinner.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestLoadingSpinnerComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
