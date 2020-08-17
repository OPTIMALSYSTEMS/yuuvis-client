import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  BaseObjectTypeField,
  ColumnConfig,
  ColumnConfigColumn,
  ContentStreamField,
  ObjectType,
  ObjectTypeField,
  SortOption,
  SystemService,
  SystemType,
  TranslateService,
  UserConfigService,
  Utils
} from '@yuuvis/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { Selectable, SelectableGroup } from '../../grouped-select';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { addCircle, arrowDown, clear, dragHandle, pin, sort } from '../../svg.generated';

/**
 * This component is for configuring a result list column configuration for an object.
 *
 * Set the components **type** property to an ObjectType or an object type id to load and edit
 * the column configuration for that type. In order to create/edit the column configuration for
 * a mixed result list you need to pass in the base object type (systemService.getBaseType()).
 *
 * Mixed result list configurations will be applied to result list that contain different
 * types of objects with columns that are shared by all object types.
 *
 * [Screenshot](../assets/images/yuv-column-config.gif)
 *
 * @example
 * <yuv-column-config [options]="data" (configSaved)="columnConfigChanged($event, popover)"></yuv-column-config>
 *
 */
@Component({
  selector: 'yuv-column-config',
  templateUrl: './column-config.component.html',
  styleUrls: ['./column-config.component.scss']
})
export class ColumnConfigComponent implements OnInit {
  @ViewChild('tplColumnPicker') tplColumnPicker: TemplateRef<any>;

  private _objectType: ObjectType;
  private _objectTypeFields: ObjectTypeField[];

  // fields that should not be available for column config
  private skipFields = [
    BaseObjectTypeField.OBJECT_ID,
    BaseObjectTypeField.PARENT_ID,
    BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_VERSION_NUMBER,
    BaseObjectTypeField.TENANT,
    BaseObjectTypeField.TRACE_ID,
    // BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS,
    BaseObjectTypeField.BASE_TYPE_ID,
    ContentStreamField.ID,
    ContentStreamField.RANGE,
    ContentStreamField.REPOSITORY_ID,
    ContentStreamField.DIGEST,
    ContentStreamField.ARCHIVE_PATH
  ];

  title: string;

  // Columns that are part of the current column configuration
  columnConfig: ColumnConfig;
  // The column config that has been fetched from the backend (for being able to reset)
  private _loadedColumnConfig: ColumnConfig;
  moreColumnsAvailable: boolean;
  showCancelButton: boolean;
  columnConfigDirty: boolean;
  busy: boolean;
  error: string;

  labels: any;

  /**
   * ColumnConfigInput holding the object type (and maybe the context) & custom sort options
   * to edit the column configuration for
   */
  @Input() set options(options: { type: string | ObjectType; sortOptions?: SortOption[] }) {
    const type = options && options.type;
    if (type) {
      this.columnConfigDirty = false;
      this._objectType = typeof type === 'string' ? this.fetchObjectType(type) : type;
      this.title = this._objectType.id === SystemType.OBJECT ? this.translate.instant('yuv.framework.column-config.type.mixed.label') : this._objectType.label;
      this._objectTypeFields = this._objectType ? this.filterFields(this._objectType.fields) : [];
      this.fetchColumnConfig(this._objectType ? this._objectType.id : null, options.sortOptions);
    }
  }
  /**
   * Emitted when the column configuration has been changed and saved
   * to the backend. Will emitt the updated column configuration.
   */
  @Output() configSaved = new EventEmitter<ColumnConfig>();
  /**
   * Adding a listener for this output will show a cancel button
   * inside the components action bar and an event will be emitted
   * once the button has been clicked.
   */
  @Output() cancel = new EventEmitter();

  constructor(
    private systemService: SystemService,
    private userConfig: UserConfigService,
    private translate: TranslateService,
    private iconRegistry: IconRegistryService,
    private popoverService: PopoverService
  ) {
    this.iconRegistry.registerIcons([dragHandle, arrowDown, clear, addCircle, pin, sort]);
    this.labels = {
      pinned: this.translate.instant('yuv.framework.column-config.column.button.pinned.title'),
      sort: this.translate.instant('yuv.framework.column-config.column.button.sort.title'),
      error: {
        load: this.translate.instant('yuv.framework.column-config.error.load'),
        save: this.translate.instant('yuv.framework.column-config.error.save')
      }
    };
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.columnConfig.columns, event.previousIndex, event.currentIndex);
    this.columnConfigDirty = true;
  }

  showColumnPicker() {
    const groups: SelectableGroup[] = [
      {
        id: 'type',
        label: this.translate.instant('yuv.framework.column-config.add.group.type'),
        items: this.getSelectables(this._objectTypeFields)
      }
    ];

    const popoverConfig: PopoverConfig = {
      maxHeight: '70%',
      data: {
        groups: groups
      }
    };
    this.popoverService.open(this.tplColumnPicker, popoverConfig);
  }

  onPickerResult(selectedFields: Selectable[], popoverRef?: PopoverRef) {
    selectedFields.forEach((selectable) =>
      this.columnConfig.columns.push({
        id: selectable.id,
        label: selectable.label
      })
    );
    this.checkMoreColumnsAvailable();
    this.columnConfigDirty = true;
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
    this.columnConfig.columns = this.columnConfig.columns.filter((c) => c.id !== column.id);
    this.checkMoreColumnsAvailable();
    this.columnConfigDirty = true;
  }

  toggleSort(column: ColumnConfigColumn) {
    if (column.sort === 'asc') {
      column.sort = 'desc';
    } else if (column.sort === 'desc') {
      column.sort = null;
    } else {
      column.sort = 'asc';
    }
    this.columnConfigDirty = true;
  }

  togglePinned(column: ColumnConfigColumn) {
    column.pinned = !column.pinned;
    this.columnConfigDirty = true;
  }

  revert() {
    this.error = null;
    this.resetConfig({ ...this._loadedColumnConfig });
    this.columnConfigDirty = false;
    this.checkMoreColumnsAvailable();
  }

  save() {
    this.busy = true;
    this.error = null;
    this.userConfig.saveColumnConfig(this.columnConfig).subscribe(
      (res) => {
        this.busy = false;
        this.configSaved.emit(this.columnConfig);
        this.resetConfig(this.columnConfig);
        this.columnConfigDirty = false;
      },
      (err) => {
        this.busy = false;
        console.log(err);
        this.error = this.labels.error.save;
      }
    );
  }

  private resetConfig(config: ColumnConfig): ColumnConfig {
    this._loadedColumnConfig = {
      type: config.type,
      columns: config.columns.map((c) => ({ ...c }))
    };
    return (this.columnConfig = config);
  }

  private filterFields(fields: ObjectTypeField[]) {
    return fields.filter((f) => !this.skipFields.includes(f.id));
  }

  private checkMoreColumnsAvailable() {
    this.moreColumnsAvailable = this._objectTypeFields.length > this.columnConfig.columns.length;
  }

  private fetchColumnConfig(objectTypeId: string, sortOptions: SortOption[]): void {
    this.busy = true;
    this.error = null;
    this.userConfig.getColumnConfig(objectTypeId || SystemType.OBJECT).subscribe(
      (res) => {
        this.busy = false;
        this.resetConfig({
          type: objectTypeId,
          columns: [...res.columns]
        });
        this.checkMoreColumnsAvailable();

        // preset sort options with custom values
        if (sortOptions) {
          this.columnConfig.columns.forEach((col) => {
            const sortOption = sortOptions.find((o) => col.id === o.field);
            if ((col.sort || '') !== ((sortOption && sortOption.order) || '')) {
              col.sort = sortOption ? (sortOption.order as any) : null;
              this.columnConfigDirty = true;
            }
          });
        }
      },
      (err) => {
        console.error(err);
        this.busy = false;
        this.error = this.labels.error.load;
        this.resetConfig({
          type: objectTypeId,
          columns: []
        });
        this.checkMoreColumnsAvailable();
      }
    );
  }

  private getSelectables(fields: ObjectTypeField[]): Selectable[] {
    const existingColumnIDs = this.columnConfig.columns.map((c) => c.id);
    return fields
      .filter((f) => !existingColumnIDs.includes(f.id))
      .map((f) => ({
        id: f.id,
        label: this.systemService.getLocalizedResource(`${f.id}_label`),
        description: this.systemService.getLocalizedResource(`${f.id}_description`),
        value: f
      }))
      .sort(Utils.sortValues('label'));
  }

  private fetchObjectType(id: string): ObjectType {
    return this.systemService.getObjectType(id, true);
  }

  ngOnInit() {
    this.showCancelButton = !!this.cancel.observers.length;
  }
}
