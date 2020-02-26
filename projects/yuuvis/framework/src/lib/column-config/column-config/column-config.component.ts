import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { BaseObjectTypeField, ContentStreamField, ObjectType, ObjectTypeField, RetentionField, SystemService, TranslateService, Utils } from '@yuuvis/core';
import { Selectable, SelectableGroup } from '../../grouped-select';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { addCircle, arrowDown, clear, dragHandle } from '../../svg.generated';
import { ColumnConfig, ColumnConfigColumn, ColumnConfigInput } from '../column-config.interface';

/**
 * Component for configuring a result list column configuration for an object type
 * or an object type within a context.
 *
 * There are three types of configurations available.
 *
 * - Mixed result list configuration (result lists that contain entries of different object types)
 * - Object type (result lists that only contain entries of a particular object type)
 * - Object type within context (result lists of a particular object type within a context)
 */
@Component({
  selector: 'yuv-column-config',
  templateUrl: './column-config.component.html',
  styleUrls: ['./column-config.component.scss']
})
export class ColumnConfigComponent implements OnInit {
  @ViewChild('tplColumnPicker', { static: false }) tplColumnPicker: TemplateRef<any>;

  private _objectType: ObjectType;
  private _contextType: ObjectType;

  private _objectTypeFields: ObjectTypeField[];
  // fields of the context type that are available for being used in the column config
  private _contextTypeFields: ObjectTypeField[];

  // fields that should not be available for column confiig
  private skipFields = [
    ...Object.keys(RetentionField).map(k => RetentionField[k]),
    BaseObjectTypeField.OBJECT_ID,
    BaseObjectTypeField.CREATED_BY,
    BaseObjectTypeField.MODIFIED_BY,
    BaseObjectTypeField.OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_ID,
    BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_VERSION_NUMBER,
    BaseObjectTypeField.TENANT,
    BaseObjectTypeField.TRACE_ID,
    BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS,
    BaseObjectTypeField.BASE_TYPE_ID,
    ContentStreamField.ID,
    ContentStreamField.RANGE,
    ContentStreamField.REPOSITORY_ID,
    ContentStreamField.DIGEST,
    ContentStreamField.ARCHIVE_PATH
  ];

  title = {
    type: null,
    context: null
  };

  // Columns that are part of the current column configuration
  columnConfig: ColumnConfig;
  moreColumnsAvailable: boolean;

  /**
   * ColumnConfigInput holding the object type (and maybe the context)
   * to edit the column configuration for
   */
  @Input() set type(input: ColumnConfigInput) {
    if (input.type) {
      this._objectType = typeof input.type === 'string' ? this.fetchObjectType(input.type) : input.type;
      this.title.type = this.systemService.getLocalizedResource(`${this._objectType.id}_label`);
    } else {
      this._objectType = this.systemService.getBaseType();
      this.title.type = this.translate.instant('yuv.framework.column-config.title.mixed');
    }
    if (input.context) {
      this._contextType = typeof input.context === 'string' ? this.fetchObjectType(input.context) : input.context;
    } else {
      this._contextType = null;
    }

    this.title.context = this._contextType ? this.systemService.getLocalizedResource(`${this._contextType.id}_label`) : null;
    this._objectTypeFields = this._objectType ? this.filterFields(this._objectType.fields) : [];
    this._contextTypeFields = this._contextType ? this.getAvailableContextTypeFields(this._contextType) : [];
    this.fetchColumnConfig(this._objectType ? this._objectType.id : null, this._contextType ? this._contextType.id : null);
    this.checkMoreColumnsAvailable();
  }
  /**
   * Emitted when the column configuration has been changed
   */
  @Output() configChanged = new EventEmitter();

  constructor(
    private systemService: SystemService,
    private translate: TranslateService,
    private iconRegistry: IconRegistryService,
    private popoverService: PopoverService
  ) {
    this.iconRegistry.registerIcons([dragHandle, arrowDown, clear, addCircle]);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columnConfig.columns, event.previousIndex, event.currentIndex);
  }

  showColumnPicker() {
    const groups: SelectableGroup[] = [
      {
        id: 'type',
        label: this.translate.instant('yuv.framework.column-config.add.group.type'),
        items: this.getSelectables(this._objectTypeFields)
      }
    ];
    if (this._contextTypeFields.length) {
      groups.push({
        id: 'context',
        label: this.translate.instant('yuv.framework.column-config.add.group.context'),
        items: this.getSelectables(this._contextTypeFields)
      });
    }

    const popoverConfig: PopoverConfig = {
      // width: '55%',
      // height: '70%',
      maxHeight: '90%',
      data: {
        groups: groups
      }
    };
    this.popoverService.open(this.tplColumnPicker, popoverConfig);
  }

  onPickerResult(selectedFields: Selectable[], popoverRef?: PopoverRef) {
    console.log(selectedFields);

    selectedFields.forEach(selectable =>
      this.columnConfig.columns.push({
        id: selectable.id,
        label: selectable.label,
        propertyType: selectable.value.propertyType
      })
    );
    this.checkMoreColumnsAvailable();
    if (popoverRef) {
      popoverRef.close();
    }
  }

  onPickerCancel(popoverRef?: PopoverRef) {
    if (popoverRef) {
      popoverRef.close();
    }
  }

  removeColumn(column: ColumnConfigColumn) {
    this.columnConfig.columns = this.columnConfig.columns.filter(c => c.id !== column.id);
    this.checkMoreColumnsAvailable();
  }

  toggleSort(column: ColumnConfigColumn) {
    if (column.sort === 'asc') {
      column.sort = 'desc';
    } else if (column.sort === 'desc') {
      column.sort = null;
    } else {
      column.sort = 'asc';
    }
  }

  private filterFields(fields: ObjectTypeField[]) {
    return fields.filter(f => !this.skipFields.includes(f.id));
  }

  private checkMoreColumnsAvailable() {
    this.moreColumnsAvailable = this._objectTypeFields.length + this._contextTypeFields.length > this.columnConfig.columns.length;
  }

  private fetchColumnConfig(objectTypeId: string, contextTypeId: string): void {
    // TODO: load existing column configuration for the given input
    this.columnConfig = {
      type: objectTypeId,
      context: contextTypeId,
      columns: []
    };
  }

  private getSelectables(fields: ObjectTypeField[]): Selectable[] {
    const existingColumnIDs = this.columnConfig.columns.map(c => c.id);
    return fields
      .filter(f => !existingColumnIDs.includes(f.id))
      .map(f => ({
        id: f.id,
        label: this.systemService.getLocalizedResource(`${f.id}_label`),
        description: this.systemService.getLocalizedResource(`${f.id}_description`),
        value: f
      }))
      .sort(Utils.sortValues('label'));
  }

  private fetchObjectType(id: string): ObjectType {
    return this.systemService.getObjectType(id);
  }

  // get the fields of a context type that are available to be used for column config
  private getAvailableContextTypeFields(contextType: ObjectType): ObjectTypeField[] {
    return this.filterFields(contextType.fields);
    // TODO: return contextType.fields.filter(f => f.selectedForEnrichment);
  }

  ngOnInit() {}
}
