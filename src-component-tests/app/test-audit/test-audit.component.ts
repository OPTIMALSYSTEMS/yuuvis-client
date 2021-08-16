import { Component } from '@angular/core';
import { BaseObjectTypeField, DmsObject, SearchFilter, SearchQuery, SystemType } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-audit',
  templateUrl: './test-audit.component.html',
  styleUrls: ['./test-audit.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestAuditComponent {
  dmsObject: DmsObject;
  objectQuery: SearchQuery;

  constructor() {
    const q = new SearchQuery();
    q.addFilter(new SearchFilter(BaseObjectTypeField.VERSION_NUMBER, SearchFilter.OPERATOR.GREATER_THAN, 2));
    q.types = [SystemType.DOCUMENT];
    this.objectQuery = q;
  }

  setDmsObject(o: DmsObject) {
    this.dmsObject = o;
  }
}
