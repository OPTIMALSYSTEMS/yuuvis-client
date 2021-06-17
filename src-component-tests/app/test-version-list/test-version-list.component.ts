import { Component, OnInit } from '@angular/core';
import { BaseObjectTypeField, DmsObject, SearchFilter, SearchQuery, SystemType } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-version-list',
  templateUrl: './test-version-list.component.html',
  styleUrls: ['./test-version-list.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestVersionListComponent implements OnInit {
  dmsObjectID: string;
  objectQuery: SearchQuery;

  constructor() {
    const q = new SearchQuery();
    q.addFilter(new SearchFilter(BaseObjectTypeField.VERSION_NUMBER, SearchFilter.OPERATOR.GREATER_THAN, 2));
    q.types = [SystemType.DOCUMENT];
    this.objectQuery = q;
  }

  setDmsObjectInput(dmsObject: DmsObject) {
    this.dmsObjectID = dmsObject?.id;
  }

  ngOnInit() {}
}
