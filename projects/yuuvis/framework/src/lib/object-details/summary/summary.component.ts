import { Component, Input } from '@angular/core';
import { BaseObjectTypeField, ContentStreamField, DmsObject, ParentField, SystemService, UserService } from '@yuuvis/core';
import { ColDef, ICellRendererFunc } from 'ag-grid-community';
import { GridService } from '../../services/grid/grid.service';
import { Summary } from './summary.interface';

@Component({
  selector: 'yuv-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent {
  summary: Summary;

  @Input()
  set dmsObject(dmsObject: DmsObject) {
    if (dmsObject) {
      this.summary = this.generateSummary(dmsObject);
    }
  }

  constructor(private systemService: SystemService, private gridService: GridService, private userService: UserService) {}

  get hasRights(): boolean {
    return this.userService.hasAdministrationRoles;
  }

  private generateSummary(dmsObject: DmsObject) {
    const summary: Summary = {
      core: [],
      base: [],
      extras: [],
      parent: []
    };

    const skipFields: string[] = [
      ContentStreamField.ID,
      BaseObjectTypeField.OBJECT_TYPE_ID,
      BaseObjectTypeField.TENANT,
      BaseObjectTypeField.PARENT_ID,
      BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
      BaseObjectTypeField.PARENT_VERSION_NUMBER,
      'tenKolibri:tableofnotices',
      'clienttitle',
      'clientdescription'
    ];

    const defaultBaseFields: { key: string; order: number }[] = [
      { key: BaseObjectTypeField.CREATION_DATE, order: 1 },
      { key: BaseObjectTypeField.CREATED_BY, order: 2 },
      { key: BaseObjectTypeField.MODIFICATION_DATE, order: 3 },
      { key: BaseObjectTypeField.MODIFIED_BY, order: 4 },
      { key: BaseObjectTypeField.VERSION_NUMBER, order: 5 },
      { key: ContentStreamField.FILENAME, order: 6 },
      { key: ContentStreamField.LENGTH, order: 7 },
      { key: ContentStreamField.MIME_TYPE, order: 8 },
      { key: BaseObjectTypeField.OBJECT_ID, order: 9 },
      { key: BaseObjectTypeField.PARENT_ID, order: 10 }
    ];

    const patentFields: string[] = [
      ParentField.asvaktenzeichen,
      ParentField.asvaktenzeichentext,
      ParentField.asvsichtrechte,
      ParentField.asvvorgangsname,
      ParentField.asvvorgangsnummer
    ];

    let baseFields = dmsObject.isFolder
      ? this.systemService.getBaseFolderType().fields.map(f => f.id)
      : this.systemService.getBaseDocumentType().fields.map(f => f.id);
    baseFields = baseFields.filter(fields => defaultBaseFields.filter(defFields => defFields.key === fields).length === 0);

    const extraFields: string[] = [ContentStreamField.DIGEST, ContentStreamField.ARCHIVE_PATH, ContentStreamField.REPOSITORY_ID];
    baseFields.map(fields => extraFields.push(fields));
    this.gridService.getColumnConfiguration(dmsObject.objectTypeId).subscribe((colDef: ColDef[]) => {
      Object.keys(dmsObject.data).forEach((key: string) => {
        const prepKey = key.startsWith('parent.') ? key.replace('parent.', '') : key;

        const label = this.systemService.getLocalizedResource(`${key}_label`);
        const def: ColDef = colDef.find(cd => cd.field === prepKey);
        const renderer: ICellRendererFunc = def ? (def.cellRenderer as ICellRendererFunc) : null;
        const si = {
          label: label ? label : key,
          value: renderer ? renderer({ value: dmsObject.data[key] }) : dmsObject.data[key],
          order: null
        };

        if (key === 'enaio:objectTypeId') {
          si.value = this.systemService.getLocalizedResource(`${dmsObject.data[key]}_label`);
        }
        if (extraFields.includes(prepKey)) {
          summary.extras.push(si);
        } else if (defaultBaseFields.find(field => field.key.startsWith(prepKey))) {
          defaultBaseFields.map(field => (field.key === prepKey ? (si.order = field.order) : null));
          summary.base.push(si);
        } else if (patentFields.includes(prepKey)) {
          summary.parent.push(si);
        } else if (!skipFields.includes(prepKey)) {
          summary.core.push(si);
        }

        summary.base.sort((a, b) => a.order - b.order);
      });
    });

    return summary;
  }
}
