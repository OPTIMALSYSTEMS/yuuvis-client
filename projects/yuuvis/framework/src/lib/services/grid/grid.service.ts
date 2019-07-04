import { Injectable } from '@angular/core';
import { ObjectType, SystemService } from '@yuuvis/core';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  context;

  constructor(private systemService: SystemService) {}

  getColumnConfiguration(objectTypeId?: string): string[] {
    if (objectTypeId) {
      const objecttype: ObjectType = this.systemService.getObjectType(
        objectTypeId
      );
      return objecttype.fields.map(f =>
        this.systemService.getLocalizedResource(`${f.id}_label`)
      );
    } else {
      return this.systemService.getBaseParamsFields();
    }
  }
}
