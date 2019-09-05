import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../add.data.service';

@Component({
  selector: 'yuv-test-object-details',
  templateUrl: './test-object-details.component.html',
  styleUrls: ['./test-object-details.component.scss']
})
export class TestObjectDetailsComponent implements OnInit {
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

  ngOnInit() {}
}
