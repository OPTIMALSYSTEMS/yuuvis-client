import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { PendingChangesService } from '@yuuvis/core';
import { takeUntil } from 'rxjs/operators';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { UnsubscribeOnDestroy } from '../../../common/util/unsubscribe.component';
import { clear, deleteIcon } from '../../../svg.generated';
import { ObjectFormComponent } from '../../object-form/object-form.component';
import { EditRow, EditRowResult } from '../form-element-table.component';

/**
 * Component for editing a row from an object forms table.
 */

@Component({
  selector: 'yuv-row-edit',
  templateUrl: './row-edit.component.html',
  styleUrls: ['./row-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RowEditComponent extends UnsubscribeOnDestroy {
  @ViewChild('confirmDelete') confirmDeleteButton: ElementRef;

  // ID set by pendingChanges service when editing row data
  // Used to finish the pending task when editing is done
  pendingTaskId: string;

  _row: EditRow;
  isNewRow: boolean;
  formState: any = {};
  queryEnabled = true;
  copyEnabled = true;
  deleteEnabled = true;
  saveEnabled = true;
  createNewCheckbox: FormControl;
  createNewRow = false;
  _showDeleteDialog = false;

  set showDeleteDialog(val: boolean) {
    this._showDeleteDialog = val;

    if (this._showDeleteDialog) {
      setTimeout(() => this.confirmDeleteButton.nativeElement.focus(), 0);
    }
  }

  get showDeleteDialog() {
    return this._showDeleteDialog;
  }

  @Input()
  set row(r: EditRow) {
    this._row = r;
    this.queryEnabled = r.situation === 'SEARCH';
    this.copyEnabled = !this.queryEnabled;
    this.saveEnabled = !this.queryEnabled;
    this.deleteEnabled = !this.queryEnabled;
    this.isNewRow = this._row.index === -1;
  }

  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter<EditRowResult>();
  @Output() onSaveCopy = new EventEmitter<EditRowResult>();
  @Output() onDelete = new EventEmitter<number>();

  @ViewChild('rowForm') rowForm: ObjectFormComponent;

  constructor(private pendingChanges: PendingChangesService, private fb: FormBuilder, private iconRegistry: IconRegistryService) {
    super();
    this.iconRegistry.registerIcons([deleteIcon, clear]);
    this.createNewCheckbox = this.fb.control(this.createNewRow);
    this.createNewCheckbox.valueChanges.pipe(takeUntil(this.componentDestroyed$)).subscribe((v) => (this.createNewRow = v));
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
      this.pendingTaskId = this.pendingChanges.startTask();
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

  delete() {
    this.onDelete.emit(this._row.index);
    this.showDeleteDialog = false;
  }

  cancel() {
    this.finishPending();
    this.onCancel.emit();
  }
}
