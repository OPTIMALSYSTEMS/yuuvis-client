import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Classification, DmsObject, SearchFilter, SearchFilterGroup, SearchQuery, SystemService, TranslateService } from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { ROUTES, YuvRoutes } from '../../../routing/routes';
import { reference } from '../../../svg.generated';
import { DmsObjectTarget } from '../../action-target';
import { LinkAction } from '../../interfaces/action.interface';
import { SelectionRange } from '../../selection-range.enum';

@Component({
  selector: 'yuv-reference-action',
  template: ``
})
export class ReferenceActionComponent extends DmsObjectTarget implements LinkAction {
  label: string;
  description: string;
  priority = 6;
  iconSrc = reference.data;
  group = 'common';
  range = SelectionRange.SINGLE_SELECT;

  constructor(private translate: TranslateService, private router: Router, @Inject(ROUTES) private routes: YuvRoutes, private system: SystemService) {
    super();
    this.label = this.translate.instant('yuv.framework.action-menu.action.show.references.label');
    this.description = this.translate.instant('yuv.framework.action-menu.action.show.references.description');
  }

  isExecutable(item: DmsObject): Observable<boolean> {
    return of(!!(this.routes && this.routes.result));
  }

  getParams(selection: DmsObject[]): any {
    let params = {};
    params[this.routes.result.queryParams.query] = this.createQuery(selection[0]);
    return params;
  }

  getLink(selection: DmsObject[]): string {
    return '/' + this.routes.result.path;
  }

  createQuery(dmsObject: DmsObject): string {
    let query = new SearchQuery();
    const { id, objectTypeId } = dmsObject;
    const filters = Object.values(this.system.system.allFields)
      .filter((field) => this.filter(field, objectTypeId))
      .map((field) => this.createFilter(field, id));
    let group = SearchFilterGroup.fromArray(filters);
    group.operator = SearchFilterGroup.OPERATOR.OR;
    query.addFilterGroup(group);
    return JSON.stringify(query.toQueryJson());
  }

  filter(field, objectTypeId) {
    return (
      (field.classifications && field.classifications.includes(Classification.STRING_REFERENCE) && field.classifications.includes(objectTypeId)) ||
      (field.classifications && field.classifications.includes(Classification.STRING_REFERENCE + '[]'))
    );
  }

  createFilter(field, id) {
    const operator = field.cardinality === 'multi' ? SearchFilter.OPERATOR.IN : SearchFilter.OPERATOR.IN;
    const value = field.cardinality === 'multi' ? [id] : [id];
    return new SearchFilter(field.id, operator, value);
  }
}
