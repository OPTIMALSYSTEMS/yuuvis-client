import { ColDef, ICellRendererFunc } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import {
  AppCacheService,
  BaseObjectTypeField,
  ContentStreamField,
  DmsObject,
  ObjectTypeField,
  ParentField,
  SecondaryObjectTypeField,
  SystemService,
  Utils
} from '@yuuvis/core';
import { GridService } from '../../services/grid/grid.service';
import { Summary, SummaryEntry } from './summary.interface';

/**
 * Component that reders a summary for a given `DmsObject`. It will list the index data set for the
 * object devided into sections.
 */
@Component({
  selector: 'yuv-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  private STORAGE_KEY_ACTIVE_INDEX = 'yuv.framework.summary.active-index';
  summary: Summary;
  activeIndex: number[] = null;
  dmsObjectID: string;

  /**
   * `DmsObject` to show the summary for
   */
  @Input()
  set dmsObject(dmsObject: DmsObject) {
    if (dmsObject) {
      this.dmsObjectID = dmsObject.id;
      this.summary = this.generateSummary(dmsObject);

      if (this.activeIndex === null) {
        this.activeIndex = [0, 1];
        if (this.showExtrasSection) {
          this.activeIndex.push(2);
        }
        if (this.summary.parent.length > 0) {
          this.activeIndex.push(3);
        }
      }
    } else {
      this.summary = null;
    }
  }

  /**
   * `DmsObject` to compare changes between objects
   */
  @Input() dmsObject2: DmsObject;

  /**
   * Whether or not to show the extras section that holds the more technical data for the object
   */
  @Input() showExtrasSection: boolean;

  isEmpty = v => Utils.isEmpty(v);
  isVersion = v => v === BaseObjectTypeField.VERSION_NUMBER;

  classes = (v1, v2) => ({
    entry: true,
    diffActive: !!this.dmsObject2,
    new: !!this.dmsObject2 && this.isEmpty(v1) && !this.isEmpty(v2),
    removed: !!this.dmsObject2 && !this.isEmpty(v1) && this.isEmpty(v2),
    modified: !!this.dmsObject2 && !this.isEmpty(v1) && !this.isEmpty(v2)
  });

  constructor(private systemService: SystemService, private gridService: GridService, private appCacheService: AppCacheService) {}

  sectionOpen(e) {
    const activeIndex = this.activeIndex.filter(i => i !== e.index);
    activeIndex.push(e.index);
    this.setState(activeIndex);
  }
  sectionClose(e) {
    this.setState(this.activeIndex.filter(i => i !== e.index));
  }

  private setState(activeIndex: number[]) {
    this.activeIndex = activeIndex;
    this.appCacheService.setItem(this.STORAGE_KEY_ACTIVE_INDEX, this.activeIndex).subscribe();
  }

  private excludeTables(objectTypeId): string[] {
    return this.systemService
      .getObjectType(objectTypeId)
      .fields.filter((fields: ObjectTypeField) => fields.propertyType === 'table')
      .map((field: ObjectTypeField) => field.id);
  }

  private getSummaryConfiguration(dmsObject: DmsObject) {
    const skipFields: string[] = [
      ContentStreamField.ID,
      BaseObjectTypeField.OBJECT_TYPE_ID,
      BaseObjectTypeField.TENANT,
      BaseObjectTypeField.ACL,
      BaseObjectTypeField.PARENT_ID,
      BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
      BaseObjectTypeField.PARENT_VERSION_NUMBER,
      ...this.excludeTables(dmsObject.objectTypeId)
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

    return { skipFields, extraFields, patentFields, defaultBaseFields };
  }

  private generateSummary(dmsObject: DmsObject) {
    const summary: Summary = {
      core: [],
      base: [],
      extras: [],
      parent: []
    };

    const { skipFields, patentFields, extraFields, defaultBaseFields } = this.getSummaryConfiguration(dmsObject);

    this.gridService.getColumnConfiguration(dmsObject.objectTypeId).subscribe((colDef: ColDef[]) => {
      Object.keys(dmsObject.data).forEach((key: string) => {
        const prepKey = key.startsWith('parent.') ? key.replace('parent.', '') : key;
        const label = this.systemService.getLocalizedResource(`${key}_label`);
        const def: ColDef = colDef.find(cd => cd.field === prepKey);
        const renderer: ICellRendererFunc = def ? (def.cellRenderer as ICellRendererFunc) : null;
        const si: SummaryEntry = {
          label: label ? label : key,
          key,
          value: renderer ? renderer({ value: dmsObject.data[key] }) : dmsObject.data[key],
          value2: this.dmsObject2 && (renderer ? renderer({ value: this.dmsObject2.data[key] }) : this.dmsObject2.data[key]),
          order: null
        };

        if (key === BaseObjectTypeField.OBJECT_TYPE_ID) {
          si.value = this.systemService.getLocalizedResource(`${dmsObject.data[key]}_label`);
        }
        if (this.dmsObject2 && (si.value === si.value2 || this.isVersion(key) || key === BaseObjectTypeField.MODIFICATION_DATE)) {
          // skip equal and irrelevant values
        } else if (extraFields.includes(prepKey)) {
          summary.extras.push(si);
        } else if (defaultBaseFields.find(field => field.key.startsWith(prepKey))) {
          defaultBaseFields.map(field => (field.key === prepKey ? (si.order = field.order) : null));
          summary.base.push(si);
        } else if (patentFields.includes(prepKey)) {
          summary.parent.push(si);
        } else if (!skipFields.includes(prepKey)) {
          summary.core.push(si);
        }
      });

      summary.base.sort((a, b) => a.order - b.order);
      summary.core
        .sort((a, b) => (a.key === SecondaryObjectTypeField.DESCRIPTION ? -1 : b.key === SecondaryObjectTypeField.DESCRIPTION ? 1 : 0))
        .sort((a, b) => (a.key === SecondaryObjectTypeField.TITLE ? -1 : b.key === SecondaryObjectTypeField.TITLE ? 1 : 0));
    });

    return summary;
  }

  ngOnInit(): void {
    // TODO: store component state using a general service
    this.appCacheService.getItem(this.STORAGE_KEY_ACTIVE_INDEX).subscribe((activeIndex: number[]) => {
      if (activeIndex !== null) {
        this.activeIndex = activeIndex;
      }
    });
  }
}
