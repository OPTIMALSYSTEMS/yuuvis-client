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

  isExecutable(dmsObject: DmsObject): Observable<boolean> {
    return of(!!(this.routes && this.routes.result && this.createSearchFilters(dmsObject).length));
  }

  getParams(selection: DmsObject[]): any {
    let params = {};
    params[this.routes.result.queryParams.query] = this.createQuery(selection[0]);
    return params;
  }

  getLink(selection: DmsObject[]): string {
    return '/' + this.routes.result.path;
  }

  private createQuery(dmsObject: DmsObject): string {
    let query = new SearchQuery();
    let group = SearchFilterGroup.fromArray(this.createSearchFilters(dmsObject));
    group.operator = SearchFilterGroup.OPERATOR.OR;
    query.addFilterGroup(group);
    return JSON.stringify(query.toQueryJson());
  }

  private createSearchFilters(dmsObject: DmsObject) {
    return Object.values(this.system.system.allFields)
      .filter((field) => this.filter(field, dmsObject))
      .map((field) => this.createSearchFilter(field, dmsObject.id));
  }

  private filter(field, dmsObject: DmsObject) {
    if (!field.classifications) {
      return false;
    }
    const referenceClassification = field.classifications.find((el) => el.includes(Classification.STRING_REFERENCE));
    return (
      referenceClassification &&
      (referenceClassification.includes(dmsObject.objectTypeId) ||
        referenceClassification.includes('system:object') ||
        (referenceClassification.includes('system:document') && !dmsObject.isFolder) ||
        (referenceClassification.includes('system:folder') && dmsObject.isFolder) ||
        !!dmsObject.data['system:secondaryObjectTypeIds'].find((sotID) => referenceClassification.includes(sotID)) ||
        referenceClassification.includes(Classification.STRING_REFERENCE + '[]'))
    );
  }

  private createSearchFilter(field, objectId) {
    const operator = field.cardinality === 'multi' ? SearchFilter.OPERATOR.IN : SearchFilter.OPERATOR.EEQUAL;
    const value = field.cardinality === 'multi' ? [objectId] : objectId;
    return new SearchFilter(field.id, operator, value);
  }
}
