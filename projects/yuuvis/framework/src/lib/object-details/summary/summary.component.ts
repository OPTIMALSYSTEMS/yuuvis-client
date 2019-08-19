import { Component, Input } from '@angular/core';
import { BaseObjectTypeField, ContentStreamField, DmsObject, SystemService } from '@yuuvis/core';
import { ColDef, ICellRendererFunc } from 'ag-grid-community';
import { ParentField } from '../../../../../core/src/public-api';
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

  constructor(private systemService: SystemService, private gridService: GridService) {}

  private generateSummary(dmsObject: DmsObject) {
    const summary: Summary = {
      core: [],
      base: [],
      extras: [],
      parent: []
    };

    const skipFields: string[] = [
      ContentStreamField.RANGE,
      ContentStreamField.ID,
      BaseObjectTypeField.OBJECT_TYPE_ID,
      BaseObjectTypeField.TENANT,
      BaseObjectTypeField.PARENT_ID,
      BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
      BaseObjectTypeField.PARENT_VERSION_NUMBER,
      'tenKolibri:tableofnotices'
    ];

    const baseFields = dmsObject.isFolder
      ? this.systemService.getBaseFolderType().fields.map(f => f.id)
      : this.systemService.getBaseDocumentType().fields.map(f => f.id);

    // const baseFields: string[] = [
    //   BaseObjectTypeField.CREATION_DATE,
    //   BaseObjectTypeField.CREATED_BY,
    //   BaseObjectTypeField.MODIFICATION_DATE,
    //   BaseObjectTypeField.MODIFIED_BY,
    //   BaseObjectTypeField.VERSION_NUMBER
    // ];

    const patentFields: string[] = [
      ParentField.asvaktenzeichen,
      ParentField.asvaktenzeichentext,
      ParentField.asvsichtrechte,
      ParentField.asvvorgangsname,
      ParentField.asvvorgangsnummer
    ];

    const extraFields: string[] = [
      BaseObjectTypeField.OBJECT_ID,
      ContentStreamField.FILENAME,
      ContentStreamField.LENGTH,
      ContentStreamField.MIME_TYPE,
      ContentStreamField.DIGEST,
      ContentStreamField.ARCHIVE_PATH,
      ContentStreamField.REPOSITORY_ID
    ];

    this.gridService.getColumnConfiguration(dmsObject.objectTypeId).subscribe((colDef: ColDef[]) => {
      console.log({ dmsObject });

      Object.keys(dmsObject.data).forEach((key: string) => {
        const prepKey = key.startsWith('parent.') ? key.replace('parent.', '') : key;

        const label = this.systemService.getLocalizedResource(`${key}_label`);
        const def: ColDef = colDef.find(cd => cd.field === prepKey);
        const renderer: ICellRendererFunc = def ? (def.cellRenderer as ICellRendererFunc) : null;
        const si = {
          label: label ? label : key,
          value: renderer ? renderer({ value: dmsObject.data[key] }) : dmsObject.data[key]
        };

        if (key === 'enaio:objectTypeId') {
          si.value = this.systemService.getLocalizedResource(`${dmsObject.data[key]}_label`);
        }

        if (extraFields.includes(prepKey)) {
          summary.extras.push(si);
        } else if (baseFields.includes(prepKey)) {
          summary.base.push(si);
        } else if (patentFields.includes(prepKey)) {
          summary.parent.push(si);
        } else if (!skipFields.includes(prepKey)) {
          summary.core.push(si);
        }
      });
    });

    console.log({ summary });

    return summary;
  }
}
