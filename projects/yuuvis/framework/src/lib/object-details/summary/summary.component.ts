import { ColDef, ICellRendererFunc } from '@ag-grid-community/core';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  AppCacheService,
  BaseObjectTypeField,
  Classification,
  ContentStreamField,
  DmsObject,
  Logger,
  ObjectTypeField,
  ObjectTypePropertyClassification,
  ParentField,
  RetentionField,
  SystemService
} from '@yuuvis/core';
import { CellRenderer } from '../../services/grid/grid.cellrenderer';
import { GridService } from '../../services/grid/grid.service';
import { Situation } from './../../object-form/object-form.situation';
import { Summary, SummaryEntry } from './summary.interface';

/**
 * This component can be used in two different ways:
 *
 * ### Show object summary
 * If you provide a DmsObject instance using the `dmsObject` input, this component renders a summary
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
@UntilDestroy()
@Component({
  selector: 'yuv-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit, OnDestroy {
  private STORAGE_KEY_SECTION_VISIBLE = 'yuv.framework.summary.section.visibility';
  summary: Summary;

  visible: any = {
    parent: true,
    core: true,
    data: false,
    baseparams: false,
    admin: true
  };

  dmsObjectID: string;
  coreFields: any[] = [];

  private _objectData;
  private _objectData2;

  /**
   * `DmsObject` to show the summary for
   */
  @Input()
  set dmsObject(dmsObject: DmsObject) {
    this.dmsObjectID = dmsObject?.id;
    // always loads form for the latest dmsObject
    const obj = this.dmsObject2?.version > dmsObject.version ? this.dmsObject2 : dmsObject;
    this.systemService.getDmsObjectForms(obj, Situation.EDIT).subscribe((form) => {
      this.coreFields = this.extractFields(form.main.elements[0]);
      this.summary = dmsObject ? this.generateSummary(dmsObject) : null;
    });
  }

  private _dmsObject2: DmsObject;
  set dmsObject2(o: DmsObject) {
    this._dmsObject2 = o;
    this._objectData2 = { ...o.data };
  }
  get dmsObject2() {
    return this._dmsObject2;
  }

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
   * Whether or not to show the extras section that holds the more technical data for the object
   */
  @Input() showExtrasSection: boolean;

  // isEmpty = v => Utils.isEmpty(v);
  isVersion = (v) => v === BaseObjectTypeField.VERSION_NUMBER;

  constructor(private systemService: SystemService, private gridService: GridService, private logger: Logger, private appCacheService: AppCacheService) {}

  onSectionVisibilityChange(k, visible: boolean) {
    this.visible[k] = visible;
    this.appCacheService.setItem(this.STORAGE_KEY_SECTION_VISIBLE, this.visible).pipe(untilDestroyed(this)).subscribe();
  }

  private getSummaryConfiguration(dmsObject: DmsObject) {
    const skipFields: string[] = [
      ContentStreamField.ID,
      BaseObjectTypeField.TENANT,
      BaseObjectTypeField.ACL,
      BaseObjectTypeField.PARENT_ID,
      BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
      BaseObjectTypeField.PARENT_VERSION_NUMBER
    ];

    const defaultBaseFields: { key: string; order: number }[] = [
      { key: BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS, order: 1 },
      { key: BaseObjectTypeField.CREATION_DATE, order: 2 },
      { key: BaseObjectTypeField.CREATED_BY, order: 3 },
      { key: BaseObjectTypeField.MODIFICATION_DATE, order: 4 },
      { key: BaseObjectTypeField.MODIFIED_BY, order: 5 },
      { key: BaseObjectTypeField.VERSION_NUMBER, order: 6 },
      { key: ContentStreamField.FILENAME, order: 7 },
      { key: ContentStreamField.LENGTH, order: 8 },
      { key: ContentStreamField.MIME_TYPE, order: 9 },
      { key: RetentionField.RETENTION_START, order: 10 },
      { key: RetentionField.RETENTION_END, order: 11 },
      { key: RetentionField.DESTRUCTION_DATE, order: 12 },
      { key: BaseObjectTypeField.TAGS, order: 13 }
    ];

    const parentFields: string[] = [
      ParentField.asvaktenzeichen,
      ParentField.asvaktenzeichentext,
      ParentField.asvsichtrechte,
      ParentField.asvvorgangsname,
      ParentField.asvvorgangsnummer
    ];

    let baseFields = dmsObject.isFolder
      ? this.systemService.getBaseFolderType().fields.map((f) => f.id)
      : this.systemService.getBaseDocumentType().fields.map((f) => f.id);

    baseFields = baseFields.filter((fields) => defaultBaseFields.filter((defFields) => defFields.key === fields).length === 0);

    const extraFields: string[] = [
      ContentStreamField.DIGEST,
      ContentStreamField.ARCHIVE_PATH,
      ContentStreamField.REPOSITORY_ID,
      BaseObjectTypeField.OBJECT_ID,
      BaseObjectTypeField.PARENT_ID,
      BaseObjectTypeField.OBJECT_TYPE_ID,
      BaseObjectTypeField.LEADING_OBJECT_TYPE_ID,
      BaseObjectTypeField.TAGS,
      'classification[systemsot]'
    ];
    baseFields.map((fields) => extraFields.push(fields));

    return { skipFields, extraFields, parentFields, defaultBaseFields };
  }

  private restructureByClassification(d, classification: string) {
    const data = { ...d };
    const sotIndex: number[] = [];
    const systemsot: string[] = [];
    data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]?.map(
      (sot, index) => this.systemService.getSecondaryObjectType(sot)?.classification?.includes(classification) && sotIndex.unshift(index) && systemsot.push(sot)
    );
    sotIndex.forEach((value, index) => [...data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]].splice(value[index], 1));
    return { ...data, 'classification[systemsot]': systemsot };
  }

  private generateValue(data, key: string, renderer: ICellRendererFunc, def: ColDef, type?: string): string | HTMLElement {
    if (key === BaseObjectTypeField.TAGS) {
      // tags cell renderer differs from the one used in the grid
      renderer = this.gridService.customContext(CellRenderer.systemTagsSummaryRenderer);
    } else if (type && type.toLowerCase() === 'table') {
      // handle tables
      renderer = (param: any) => {
        const f: any = this.systemService.system.allFields[key];
        const cdQA = {};
        f.columnDefinitions.forEach((e) => {
          // need to map classification to classification(s)
          e.classifications = e.classification;
          cdQA[e.id] = this.gridService.getColumnDefinition(e);
        });

        return param?.value && Array.isArray(param.value)
          ? `<table class="summary-table-value">
          <tr>${Object.keys(cdQA)
            .map((k) => `<th>${this.systemService.getLocalizedResource(cdQA[k].colId + '_label') || cdQA[k].colId}</th>`)
            .join('')}</tr>
          ${param.value
            .map(
              (row) =>
                `<tr>${Object.keys(cdQA)
                  .map((k) => `<td>${this.gridService.customContext(cdQA[k].cellRenderer)({ value: row[k], data: row, colDef: cdQA[k] })}</td>`)
                  .join('')}</tr>`
            )
            .join('')}
          </table>`
          : '';
      };
    }
    return typeof renderer === 'function'
      ? renderer({ value: data[key], data: data, colDef: def } as any)
      : data[key + '_title']
      ? data[key + '_title']
      : data[key];
  }

  private generateSummary(dmsObject: DmsObject) {
    const summary: Summary = {
      core: [],
      data: [],
      base: [],
      extras: [], // Admin
      parent: []
    };

    this._objectData = this.restructureByClassification(dmsObject.data, Classification.SYSTEM_SOT);
    if (this.dmsObject2) {
      this._objectData2 = this.restructureByClassification(this.dmsObject2.data, Classification.SYSTEM_SOT);
      // for versions comparison tags do not make sense
      delete this._objectData[BaseObjectTypeField.TAGS];
      delete this._objectData2[BaseObjectTypeField.TAGS];
    }

    const { skipFields, parentFields, extraFields, defaultBaseFields } = this.getSummaryConfiguration(dmsObject);
    let colDef: ColDef[] = this.gridService.getColumnDefinitions(dmsObject.objectTypeId);
    const fsots = this.systemService.getFloatingSecondaryObjectTypes(dmsObject.objectTypeId);
    fsots.forEach((fsot) => (colDef = [...colDef, ...this.gridService.getColumnDefinitions(fsot.id, true)]));

    Object.keys({ ...this._objectData, ...this._objectData2 })
      .filter((key) => !key.includes('_title') && !this.shouldBeHidden(key))
      .forEach((key: string) => {
        const prepKey = key.replace(/^parent./, ''); // todo: pls implement general solution
        const def: ColDef = colDef.find((cd) => cd.field === prepKey);
        const renderer: ICellRendererFunc = def ? (def.cellRenderer as ICellRendererFunc) : null;

        const propertyType = this.systemService.system.allFields[key] ? this.systemService.system.allFields[key].propertyType : undefined;
        const si: SummaryEntry = {
          label: (def && def.headerName) || key,
          key,
          value: this.generateValue(this._objectData, key, renderer, def, propertyType),
          value2: this.dmsObject2 && this.generateValue(this._objectData2, key, renderer, def, propertyType),
          order: null,
          type: propertyType
        };

        if (key === BaseObjectTypeField.OBJECT_TYPE_ID) {
          si.value = this.systemService.getLocalizedResource(`${this._objectData[key]}_label`);
          si.value2 = this.dmsObject2 && this.systemService.getLocalizedResource(`${this._objectData2[key]}_label`);
        }

        if (this.dmsObject2 && (si.value === si.value2 || this.isVersion(key))) {
          // skip equal and irrelevant values
        } else if (defaultBaseFields.find((field) => field.key === prepKey)) {
          si.order = defaultBaseFields.find((field) => field.key === prepKey).order;
          summary.base.push(si);
          if (extraFields.includes(prepKey)) summary.extras.push(si); // TAGS exception
        } else if (extraFields.includes(prepKey)) {
          summary.extras.push(si);
        } else if (parentFields.includes(prepKey)) {
          summary.parent.push(si);
        } else if (!skipFields.includes(prepKey)) {
          if (this.coreFields.includes(prepKey)) {
            summary.core.push(si);
          } else {
            summary.data.push(si);
          }
        }
      });
    const bp = this.systemService.getBaseProperties();
    const coreOrder = [bp.title, bp.description, ...this.coreFields];
    return {
      ...summary,
      base: summary.base.sort((a, b) => a.order - b.order),
      core: summary.core.sort((a, b) => coreOrder.indexOf(a.key) - coreOrder.indexOf(b.key))
    };
  }

  private shouldBeHidden(key: string): boolean {
    const otf: ObjectTypeField = this.systemService.system.allFields[key];
    return !this.dmsObject2 && otf?.classifications?.includes(ObjectTypePropertyClassification.SUMMARY_HIDDEN);
  }

  private extractFields(element): string[] {
    let fields = [];
    if (!element) {
      return fields;
    }
    element.elements
      ? // && element.type !== 'table'
        element.elements.forEach((el) => (fields = fields.concat(this.extractFields(el))))
      : fields.push(element.name);
    return fields;
  }

  ngOnInit(): void {
    // TODO: store component state using a general service
    this.appCacheService.getItem(this.STORAGE_KEY_SECTION_VISIBLE).subscribe((visibility: number[]) => {
      if (visibility !== null) {
        this.visible = visibility;
      }
    });
  }

  ngOnDestroy() {}
}
