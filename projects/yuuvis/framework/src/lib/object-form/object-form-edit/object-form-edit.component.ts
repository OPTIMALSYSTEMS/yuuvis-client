import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { DmsObject, DmsService, PendingChangesService, SystemService, TranslateService, Utils } from '@yuuvis/core';
import { finalize } from 'rxjs/operators';
import { NotificationService } from './../../services/notification/notification.service';
import { FormStatusChangedEvent, ObjectFormOptions } from './../object-form.interface';
import { ObjectFormComponent } from './../object-form/object-form.component';

@Component({
  selector: 'yuv-object-form-edit',
  templateUrl: './object-form-edit.component.html',
  styleUrls: ['./object-form-edit.component.scss']
})
export class ObjectFormEditComponent implements OnDestroy {
  // ID set by pendingChanges service when editing indexdata
  // Used to finish the pending task when editing is done
  private pendingTaskId: string;
  private _dmsObject: DmsObject;

  // fetch a reference to the opbject form component to be able to
  // get the form data
  @ViewChild(ObjectFormComponent, { static: false }) objectForm: ObjectFormComponent;

  @Input() formDisabled: boolean;
  @Input('dmsObject')
  set dmsObject(dmsObject: DmsObject) {
    if (dmsObject && (!this._dmsObject || this._dmsObject.id !== dmsObject.id)) {
      // reset the state of the form
      this.formState = null;
      this.controls.saving = false;
      this.controls.disabled = true;

      this.createObjectForm(dmsObject);
    }
    this._dmsObject = dmsObject;
  }
  /**
   * Emits the updated `DmsObject` when a form has been saved.
   */
  @Output() indexDataSaved = new EventEmitter<DmsObject>();

  formOptions: ObjectFormOptions;
  formState: FormStatusChangedEvent;
  busy: boolean;
  controls = {
    disabled: true,
    saving: false
  };

  // private _dmsObject: DmsObject;
  private messages = {
    formSuccess: null,
    formError: null
  };

  constructor(
    private systemService: SystemService,
    private dmsService: DmsService,
    private notification: NotificationService,
    private pendingChanges: PendingChangesService,
    public translate: TranslateService
  ) {
    this.translate.get(['yuv.framework.object-form-edit.save.success', 'yuv.framework.object-form-edit.save.error']).subscribe(res => {
      this.messages.formSuccess = res['yuv.framework.object-form-edit.save.success'];
      this.messages.formError = res['yuv.framework.object-form-edit.save.error'];
    });

    this.pendingChanges.setCustomMessage(this.translate.instant('yuv.framework.object-form-edit.pending-changes.alert'));
  }

  private startPending() {
    // because this method will be called every time the form status changes,
    // pending task will only be started once until it was finished
    if (!this.pendingChanges.hasPendingTask(this.pendingTaskId || ' ')) {
      this.pendingTaskId = this.pendingChanges.startTask();
    }
  }

  private finishPending() {
    this.pendingChanges.finishTask(this.pendingTaskId);
  }

  onFormStatusChanged(evt) {
    this.formState = evt;
    this.controls.disabled = !this.formState.dirty;
    if (this.formState.dirty) {
      this.startPending();
    } else {
      this.finishPending();
    }
  }

  // save the current dms object
  save() {
    setTimeout(() => {
      if (this.formState.dirty && !this.formState.invalid) {
        this.controls.saving = true;

        const formData = this.objectForm.getFormData();
        this.dmsService
          .updateDmsObject(this._dmsObject.id, formData)
          .pipe(finalize(() => this.finishPending()))
          .subscribe(
            updatedObject => {
              this._dmsObject = updatedObject;
              this.formOptions.data = updatedObject.data;
              this.controls.saving = false;
              this.controls.disabled = true;
              this.objectForm.setFormPristine();
              this.notification.success(this._dmsObject.title, this.messages.formSuccess);
              this.indexDataSaved.emit(this._dmsObject);
            },
            Utils.throw(
              () => {
                this.controls.saving = false;
              },
              this._dmsObject.title,
              this.messages.formError
            )
          );
      }
    }, 500);
  }

  // reset the form to its initial state
  reset() {
    this.objectForm.resetForm();
  }

  // create the formOptions required by object form component
  private createObjectForm(dmsObject: DmsObject) {
    this.busy = true;
    this.systemService.getObjectTypeForm(dmsObject.objectTypeId, 'EDIT').subscribe(
      model => {
        this.formOptions = {
          formModel: model,
          data: dmsObject.data,
          disabled: this.formDisabled || !this.isEditable(dmsObject)
        };
        if (dmsObject.contextFolder) {
          this.formOptions.context = {
            id: dmsObject.contextFolder.id,
            title: dmsObject.contextFolder.title,
            objectTypeId: dmsObject.contextFolder.objectTypeId
          };
        }
        this.busy = false;
      },
      err => {
        this.busy = false;
      }
    );
  }

  private isEditable(dmsObject: DmsObject): boolean {
    return dmsObject.hasOwnProperty('rights') && dmsObject.rights.writeIndexData;
  }

  ngOnDestroy() {}
}
