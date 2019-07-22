import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'yuv-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  summary: any;

  @Input()
  set summaryData(data: any) {
    this.summary = data;
  }

  constructor() {}

  ngOnInit() {}
}
