import { Component } from '@angular/core';
import { DmsObject, DmsService, TranslateService } from '@yuuvis/core';
import { ObjectCompareInput } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-object-details-compare',
  templateUrl: './test-object-details-compare.component.html',
  styleUrls: ['./test-object-details-compare.component.scss']
})
export class TestObjectDetailsCompareComponent {
  compare: ObjectCompareInput;

  constructor(private translate: TranslateService, private dmsService: DmsService) {}

  // compare two versions of the same dms object
  compareVersions() {
    const objectID = 'dd9bbde7-5f03-4e8b-84c6-a9036a3045d3';
    this.dmsService.getDmsObjectVersions(objectID).subscribe(
      (res: DmsObject[]) => {
        this.compare = {
          title: res[res.length - 1].title,
          first: {
            label: this.translate.instant('yuv.client.state.versions.compare.label', { version: res[0].version }),
            item: res[0]
          },
          second: {
            label: this.translate.instant('yuv.client.state.versions.compare.label', { version: res[res.length - 1].version }),
            item: res[res.length - 1]
          }
        };
      },
      err => {
        console.error(err);
      }
    );
  }

  // compare two dms objects of the same object type
  compareObjects() {
    const firstObjectID = 'b936829c-b74b-45ea-a70f-112477bfa333';
    const secondObjectID = 'b0287aa3-82e6-4d8c-b087-56a270587389';
    this.dmsService.getDmsObjects([firstObjectID, secondObjectID]).subscribe(
      (res: DmsObject[]) => {
        this.compare = {
          title: 'compare two dms objects of the same object type',
          first: {
            label: res[0].title,
            item: res[0]
          },
          second: {
            label: res[1].title,
            item: res[1]
          }
        };
      },
      err => {
        console.error(err);
      }
    );
  }
}
