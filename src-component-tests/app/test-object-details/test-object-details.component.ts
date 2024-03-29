import { Component, OnInit } from '@angular/core';
import { DmsObject, SearchQuery } from '@yuuvis/core';
import { AppDataService } from '../add.data.service';

@Component({
  selector: 'yuv-test-object-details',
  templateUrl: './test-object-details.component.html',
  styleUrls: ['./test-object-details.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestObjectDetailsComponent implements OnInit {
  summaryObject;
  objectQuery = new SearchQuery({
    types: ['tenKolibri:qadocallsinglefields']
  });

  constructor(private data: AppDataService) {}

  setDmsObjectInput(dmsObject: DmsObject) {
    this.summaryObject = dmsObject || this.data.getDmsObject();
  }

  clearDmsObjectInput() {
    this.summaryObject = null;
  }

  setDmsErrorInput() {
    this.summaryObject = { _error: 'this is an _error', id: '4711' };
  }

  onObjectRefreshed() {
    alert('REFRESH');
  }

  contentDmsObjectInput() {
    this.summaryObject = this.data.getDmsObjectWithContent();
  }

  ngOnInit() {}
}
