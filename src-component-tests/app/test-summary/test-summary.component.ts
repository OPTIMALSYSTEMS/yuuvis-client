import { Component, OnInit } from '@angular/core';
import { DmsObject } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-summary',
  templateUrl: './test-summary.component.html',
  styleUrls: ['./test-summary.component.scss']
})
export class TestSummaryComponent implements OnInit {
  private dmsObject: DmsObject = new DmsObject({
    objectTypeId: 'email:email',
    content: {
      contentStreamId: 'D3C1D523-5D37-11E9-AAA5-27E7DF182E4E',
      digest: 'F1F56858B92DC6E9242A2C03245575BE7B1FADC3D7119827BB7E117DC0D4DB46',
      archivePath: 'kolibri/2019/04/12/',
      fileName: '02 Neue OS-Webseiten sind LIVE.msg',
      mimeType: 'application/vnd.ms-outlook',
      size: 60416
    },
    fields: {}
  });

  summaryObject = this.dmsObject;

  constructor() {}

  setDmsObjectInput() {
    this.summaryObject = this.dmsObject;
  }

  clearDmsObjectInput() {
    this.summaryObject = null;
  }

  invalidDmsObjectInput() {
    this.summaryObject = {
      p: 'something'
    };
  }

  ngOnInit() {}
}
