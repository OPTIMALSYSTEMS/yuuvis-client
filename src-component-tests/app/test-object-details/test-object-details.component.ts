import { Component, OnInit } from '@angular/core';
import { DmsObject } from '@yuuvis/core';
import { AppDataService } from '../add.data.service';

@Component({
  selector: 'yuv-test-object-details',
  templateUrl: './test-object-details.component.html',
  styleUrls: ['./test-object-details.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestObjectDetailsComponent implements OnInit {
  summaryObject;

  constructor(private data: AppDataService) {}

  setDmsObjectInput(dmsObject: DmsObject) {
    this.summaryObject = dmsObject || this.data.getDmsObject();
  }

  clearDmsObjectInput() {
    this.summaryObject = null;
  }

  contentDmsObjectInput() {
    this.summaryObject = this.data.getDmsObjectWithContent();
  }

  ngOnInit() {}
}
