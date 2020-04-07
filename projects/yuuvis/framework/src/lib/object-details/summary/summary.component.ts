import { ColDef, ICellRendererFunc } from '@ag-grid-community/core';
import { Component, Input, OnInit } from '@angular/core';
import {
  AppCacheService,
  BaseObjectTypeField,
  ContentStreamField,
  DmsObject,
  Logger,
  ObjectTypeField,
  ParentField,
  SecondaryObjectTypeField,
  SystemService
} from '@yuuvis/core';
import { GridService } from '../../services/grid/grid.service';
import { Summary, SummaryEntry } from './summary.interface';

/**
 * This component can be used in two different ways:
 *
 * ### Show object summary
 * If you provide a DmsObject instance using the `dmsObject` input, this component reders a summary
 * for a given `DmsObject`. It will list existing  index data set for the object devided into sections.
 * It also displays information about the attached document file and some technical aspects.
 *
 * ### Compare objects
 * If you provide two dms objects (using input property `compareObjects`) the component will show
 * a diff between the indexdata of those 2 objects. You need to make sure that all compare objects
 * share the same object type. A good example for using this feature is comparing different
 * versions of a dms object.
 *
 * @example
 * <!-- summary of particular dms object -->
 * <yuv-summary [dmsObject]="dmsObject"></yuv-summary>
 *
 * <!-- compare two dms object -->
 * <yuv-summary [compareObjects]="[dmsObject1, dmsObject2]"></yuv-summary>
 */
@Component({
  selector: 'yuv-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  private STORAGE_KEY_SECTION_VISIBLE = 'yuv.framework.summary.section.visibility';
  summary: Summary;

  visible: any = {
    parent: true,
    core: true,
    baseparams: true,
    admin: true
  };

  dmsObjectID: string;

  /**
   * `DmsObject` to show the summary for
   */
  @Input()
  set dmsObject(dmsObject: DmsObject) {
    if (dmsObject) {
      this.dmsObjectID = dmsObject.id;
      this.summary = this.generateSummary(dmsObject);
    } else {
      this.summary = null;
    }
  }

  dmsObject2: DmsObject;

  /**
   * Two dms object to be compared against each other. They need to share
   * the same object type in order to compare them.
   */
  @Input() set compareObjects(dmsObjects: DmsObject[]) {
    // make sure that objects share the same object type
    if (dmsObjects) {
      if (dmsObjects.length === 2) {
        if (dmsObjects[0].objectTypeId === dmsObjects[1].objectTypeId) {
          this.dmsObject2 = dmsObjects[1];
          this.dmsObject = dmsObjects[0];
        } else {
          this.logger.error('summary: Invalid input. CompareObjects have to be of same object type.');
        }
      } else {
        this.logger.error('summary: Invalid input. Need 2 dms objects.');
      }
    }
  }

  /**
   * You may provide a router link config here, that will be applied to an audit entries
   * version number. This way you can add a link to the version pointing to some other
   * state/component dealing with versions of one dms object.
   */
  @Input() versionRouterLink: any[];

  /**
   * Whether or not to show the extras section that holds the more technical data for the object
   */
  @Input() showExtrasSection: boolean;

  // isEmpty = v => Utils.isEmpty(v);
  isVersion = v => v === BaseObjectTypeField.VERSION_NUMBER;

  constructor(private systemService: SystemService, private gridService: GridService, private logger: Logger, private appCacheService: AppCacheService) {}

  onSectionVisibilityChange(k, visible: boolean) {
    this.visible[k] = visible;
    this.appCacheService.setItem(this.STORAGE_KEY_SECTION_VISIBLE, this.visible).subscribe();
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
    const colDef: ColDef[] = this.gridService.getColumnDefinitions(dmsObject.objectTypeId);

    Object.keys({ ...dmsObject.data, ...(this.dmsObject2 && this.dmsObject2.data) }).forEach((key: string) => {
      const prepKey = key.startsWith('parent.') ? key.replace('parent.', '') : key; // todo: pls implement general solution
      const def: ColDef = colDef.find(cd => cd.field === prepKey);
      const renderer: ICellRendererFunc = def ? (def.cellRenderer as ICellRendererFunc) : null;
      const si: SummaryEntry = {
        label: (def && def.headerName) || key,
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

    return summary;
  }

  ngOnInit(): void {
    // TODO: store component state using a general service
    this.appCacheService.getItem(this.STORAGE_KEY_SECTION_VISIBLE).subscribe((visibility: number[]) => {
      if (visibility !== null) {
        this.visible = visibility;
      }
    });
  }
}
