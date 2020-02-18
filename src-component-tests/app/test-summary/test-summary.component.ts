import { Component, OnInit } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { DmsObject } from '@yuuvis/core';
import { AppDataService } from '../add.data.service';

@Component({
  selector: 'yuv-test-summary',
  templateUrl: './test-summary.component.html',
  styleUrls: ['./test-summary.component.scss']
})
export class TestSummaryComponent implements OnInit {
  summaryObject;

  constructor(private data: AppDataService, private localStorage: LocalStorage) {}

  // setDmsObjectInput() {
  //   this.summaryObject = this.data.getDmsObject();
  // }

  setDmsObjectInput(dmsObject: DmsObject) {
    this.summaryObject = dmsObject || this.data.getDmsObject();
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

  clearStorage() {
    this.localStorage.removeItem('yuv.framework.summary.active-index').subscribe();
  }

  ngOnInit() {}
}
