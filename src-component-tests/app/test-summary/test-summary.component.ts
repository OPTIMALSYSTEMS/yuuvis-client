import { Component, OnInit } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { DmsObject } from '@yuuvis/core';
import { AppDataService } from '../add.data.service';

@Component({
  selector: 'yuv-test-summary',
  templateUrl: './test-summary.component.html',
  styleUrls: ['./test-summary.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestSummaryComponent implements OnInit {
  summaryObject;
  showExtras: boolean;

  constructor(private data: AppDataService, private localStorage: StorageMap) { }

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
    this.localStorage.delete('yuv.framework.summary.section.visibility').subscribe();
  }

  ngOnInit() { }
}
