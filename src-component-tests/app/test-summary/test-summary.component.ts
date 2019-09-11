import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../add.data.service';

@Component({
  selector: 'yuv-test-summary',
  templateUrl: './test-summary.component.html',
  styleUrls: ['./test-summary.component.scss']
})
export class TestSummaryComponent implements OnInit {
  summaryObject;

  constructor(private data: AppDataService) {}

  setDmsObjectInput() {
    this.summaryObject = this.data.getDmsObject();
  }

  clearDmsObjectInput() {
    this.summaryObject = null;
  }

  contentDmsObjectInput() {
    this.summaryObject = this.data.getDmsObjectWithContent();
  }

  invalidDmsObjectInput() {
    this.summaryObject = {
      p: 'something'
    };
  }

  ngOnInit() {}
}
