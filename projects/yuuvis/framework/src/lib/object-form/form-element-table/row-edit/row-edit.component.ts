import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { PendingChangesService, TranslateService } from '@yuuvis/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PluginComponent } from '../../../plugins/plugin.component';
import { PopoverService } from '../../../popover/popover.service';
import { clear, deleteIcon } from '../../../svg.generated';
import { EditRow, EditRowResult } from '../form-element-table.interface';

/**
 * Component for editing a row from an object forms table.
 */

@UntilDestroy()
@Component({
  selector: 'yuv-row-edit',
  templateUrl: './row-edit.component.html',
  styleUrls: ['./row-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RowEditComponent {
  @ViewChild('deleteOverlay') deleteOverlay: TemplateRef<any>;
  @ViewChild('confirmDelete') confirmDeleteButton: ElementRef;

  // ID set by pendingChanges service when editing row data
  // Used to finish the pending task when editing is done
  pendingTaskId: string;

  _row: EditRow;
  isNewRow: boolean;
  formState: any = {};
  copyEnabled = true;
  deleteEnabled = true;
  saveEnabled = true;
  createNewCheckbox: UntypedFormControl;
  createNewRow = false;

  @Input()
  set row(r: EditRow) {
    this._row = r;
    this.isNewRow = this._row.index === -1;
    setTimeout(() => (this.rowForm.options = r.formOptions), 0);
  }

  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<EditRowResult>();
  @Output() onSaveCopy = new EventEmitter<EditRowResult>();
  @Output() onDelete = new EventEmitter<number>();

  @ViewChild('plugin') plugin: PluginComponent;

  // plugin prevents circular dependency on object-form
  pluginConfig = {
    id: 'yuv.row-edit.object-form',
    plugin: {
      component: 'yuv-object-form',
      inputs: {
        isInnerTableForm: true
      },
      outputs: {
        onFormReady: () => this.onFormReady(),
        statusChanged: ($event: any) => this.onFormStatusChanged($event)
      }
    }
  };

  get rowForm() {
    return this.plugin?.cmp; // ObjectFormComponent;
  }

  constructor(
    private pendingChanges: PendingChangesService,
    private fb: UntypedFormBuilder,
    private iconRegistry: IconRegistryService,
    private popoverService: PopoverService,
    private translate: TranslateService
  ) {
    this.iconRegistry.registerIcons([deleteIcon, clear]);
    this.createNewCheckbox = this.fb.control(this.createNewRow);
    this.createNewCheckbox.valueChanges.pipe(untilDestroyed(this)).subscribe((v) => (this.createNewRow = v));
  }

  onFormReady() {
    // execute after form has been set up, because otherwise not all of the components are ready to be used
    // if for example a form script executed `onrowedit` tries to apply a filter or something like that
    if (this._row.tableElement.onrowedit && !this._row.tableElement.readonly) {
      // Generate row API object (wrapper) for the script
      const row = {
        model: this.rowForm.getObservedScriptModel(),
        index: this._row.index,
        copyEnabled: this.copyEnabled,
        deleteEnabled: this.deleteEnabled,
        saveEnabled: this.saveEnabled,
        persisted: this.isNewRow // Not persisted if it is a new row
      };
      // Call the script function ...
      this._row.tableElement.onrowedit(this._row.tableElement, row);
      // ... and respect the result
      this.copyEnabled = row.copyEnabled;
      this.deleteEnabled = row.deleteEnabled;
      this.saveEnabled = row.saveEnabled;
    }
  }

  onFormStatusChanged(evt) {
    this.formState = evt;
    if (this.formState.dirty) {
      this.startPending();
    } else {
      this.finishPending();
    }
  }

  private startPending() {
    // because this method will be called every time the form status changes,
    // pending task will only be started once until it was finished
    if (!this.pendingChanges.hasPendingTask(this.pendingTaskId || ' ')) {
      this.pendingTaskId = this.pendingChanges.startTask(this.translate.instant('yuv.framework.object-form-edit.pending-changes.alert'));
    }
  }

  finishPending() {
    this.pendingChanges.finishTask(this.pendingTaskId);
  }

  save() {
    this.finishPending();
    setTimeout(() => {
      if (!this.formState.invalid) {
        this.onSave.emit({
          index: this._row.index,
          rowData: this.rowForm.getFormData(),
          createNewRow: this.createNewRow
        });
      }
    }, 500);
  }

  saveCopy() {
    setTimeout(() => {
      if (!this.formState.invalid) {
        this.onSaveCopy.emit({
          index: this._row.index,
          rowData: this.rowForm.getFormData(),
          createNewRow: this.createNewRow
        });
      }
    }, 500);
  }

  openDeleteDialog() {
    this.popoverService.open(this.deleteOverlay, { width: '300px' });
    setTimeout(() => this.confirmDeleteButton.nativeElement.focus(), 0);
  }

  closeDeleteDialog(popover) {
    popover.close();
  }

  delete() {
    this.onDelete.emit(this._row.index);
  }

  cancel() {
    this.finishPending();
    this.onCancel.emit();
  }
}
