import { Component, Input } from '@angular/core';
import { BaseObjectTypeField, ContentStreamField, DmsObject, SystemService } from '@yuuvis/core';
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

  constructor(private systemService: SystemService, private gridService: GridService) {}

  private generateSummary(dmsObject: DmsObject) {
    const summary: Summary = {
      core: [],
      base: [],
      extras: []
    };

    const skipFields: string[] = [
      ContentStreamField.RANGE,
      ContentStreamField.ID,
      BaseObjectTypeField.OBJECT_TYPE_ID,
      BaseObjectTypeField.TENANT,
      BaseObjectTypeField.PARENT_ID,
      BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
      BaseObjectTypeField.PARENT_VERSION_NUMBER
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
      Object.keys(dmsObject.data).forEach((key: string) => {
        const def: ColDef = colDef.find(cd => cd.field === key);
        const renderer: ICellRendererFunc = def.cellRenderer as ICellRendererFunc;
        const si = {
          label: this.systemService.getLocalizedResource(`${key}_label`),
          value: renderer ? renderer({ value: dmsObject.data[key] }) : dmsObject.data[key]
        };

        if (extraFields.includes(key)) {
          summary.extras.push(si);
        } else if (baseFields.includes(key)) {
          summary.base.push(si);
        } else if (!skipFields.includes(key)) {
          summary.core.push(si);
        }
      });
    });
    return summary;
  }
}
