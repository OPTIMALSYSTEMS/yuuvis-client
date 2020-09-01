import { Component, EventEmitter, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  BaseObjectTypeField,
  DmsObject,
  DmsService,
  PendingChangesService,
  SecondaryObjectType,
  SecondaryObjectTypeClassification,
  SystemService,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { finalize } from 'rxjs/operators';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { CombinedObjectFormComponent, CombinedObjectFormInput } from '../combined-object-form/combined-object-form.component';
import { NotificationService } from './../../services/notification/notification.service';
import { FormStatusChangedEvent, ObjectFormOptions } from './../object-form.interface';
import { Situation } from './../object-form.situation';
import { ObjectFormComponent } from './../object-form/object-form.component';

/**
 * Component rendering a form for editing an index data of the dms object.
 *
 * [Screenshot](../assets/images/yuv-object-form-edit.gif)
 *
 * @example
 * <yuv-object-form-edit [dmsObject]="dmsObject" (indexDataSaved)="onIndexDataSaved($event)"></yuv-object-form-edit>
 */

@Component({
  selector: 'yuv-object-form-edit',
  templateUrl: './object-form-edit.component.html',
  styleUrls: ['./object-form-edit.component.scss']
})
export class ObjectFormEditComponent implements OnDestroy {
  @ViewChild('tplFloatingTypePicker') tplFloatingTypePicker: TemplateRef<any>;
  @ViewChild('tplFloatingSOTypePicker') tplFloatingSOTypePicker: TemplateRef<any>;

  // ID set by pendingChanges service when editing indexdata
  // Used to finish the pending task when editing is done
  private pendingTaskId: string;
  private _dmsObject: DmsObject;
  private _secondaryObjectTypeIDs: string[];

  fsot: {
    applicableTypes: SecondaryObjectType[];
    applicableSOTs: SecondaryObjectType[];
  };

  // Indicator that we are dealing with a floating object type
  // This kind of object will use a combination of multiple forms instaed of a single one
  isFloatingObjectType: boolean;

  // fetch a reference to the opbject form component to be able to
  // get the form data
  @ViewChild(ObjectFormComponent) objectForm: ObjectFormComponent;
  @ViewChild(CombinedObjectFormComponent) afoObjectForm: CombinedObjectFormComponent;

  @Input() formDisabled: boolean;
  /**
   * DmsObject to show the details for.
   */
  @Input('dmsObject')
  set dmsObject(dmsObject: DmsObject) {
    if (this.isFloatingObjectType || (dmsObject && (!this._dmsObject || this._dmsObject.id !== dmsObject.id))) {
      // reset the state of the form
      this.formState = null;
      this.controls.saving = false;
      this.controls.disabled = true;
      this._secondaryObjectTypeIDs = [...dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]];
      this.createObjectForm(dmsObject);
    }
    this._dmsObject = dmsObject;
  }
  /**
   * Emits the updated `DmsObject` when a form has been saved.
   */
  @Output() indexDataSaved = new EventEmitter<DmsObject>();

  formOptions: ObjectFormOptions;
  combinedFormInput: CombinedObjectFormInput;
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
    public translate: TranslateService,
    private popoverService: PopoverService
  ) {
    this.translate.get(['yuv.framework.object-form-edit.save.success', 'yuv.framework.object-form-edit.save.error']).subscribe((res) => {
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

        const formData = (this.objectForm || this.afoObjectForm).getFormData();
        this.dmsService
          .updateDmsObject(this._dmsObject.id, formData)
          .pipe(finalize(() => this.finishPending()))
          .subscribe(
            (updatedObject) => {
              this._dmsObject = updatedObject;
              if (this.formOptions) {
                this.formOptions.data = updatedObject.data;
                this.objectForm.setFormPristine();
              }
              if (this.combinedFormInput) {
                this.combinedFormInput.data = updatedObject.data;
                this.afoObjectForm.setFormPristine();
              }

              this.controls.saving = false;
              this.controls.disabled = true;
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
    if (this.objectForm) {
      this.objectForm.resetForm();
    }
    if (this.afoObjectForm) {
      this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = this._secondaryObjectTypeIDs;
      this.afoObjectForm.resetForm();
    }
  }

  // create the formOptions required by object form component
  private createObjectForm(dmsObject: DmsObject) {
    this.busy = true;
    this.isFloatingObjectType = this.systemService.isFloatingObjectType(this.systemService.getObjectType(dmsObject.objectTypeId));

    if (this.isFloatingObjectType) {
      this.formOptions = null;
      this.getApplicableSecondaries(dmsObject);
      this.systemService.getFloatingObjectTypeForms(dmsObject, Situation.EDIT).subscribe(
        (res) => {
          this.combinedFormInput = {
            formModels: res,
            data: dmsObject.data,
            disabled: this.formDisabled || !this.isEditable(dmsObject),
            enableEditSOT: true
          };
          this.busy = false;
        },
        (err) => {
          this.busy = false;
        }
      );
    } else {
      this.systemService.getObjectTypeForm(dmsObject.objectTypeId, Situation.EDIT).subscribe(
        (model) => {
          this.combinedFormInput = null;
          this.formOptions = {
            formModel: model,
            data: dmsObject.data,
            objectId: dmsObject.id,
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
        (err) => {
          this.busy = false;
        }
      );
    }
  }

  private getApplicableSecondaries(dmsObject: DmsObject) {
    this.fsot = {
      applicableTypes: [],
      applicableSOTs: []
    };
    const currentSOTs = dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS];
    const alreadyAssignedPrimary =
      currentSOTs?.length > 0 &&
      currentSOTs
        .map((id) => this.systemService.getSecondaryObjectType(id))
        .filter((sot) => sot.classification?.includes(SecondaryObjectTypeClassification.PRIMARY)).length > 0;
    this.systemService
      .getObjectType(dmsObject.objectTypeId)
      .secondaryObjectTypes.filter((sot) => !sot.static && !currentSOTs?.includes(sot.id))
      .forEach((sotref) => {
        const sot = this.systemService.getSecondaryObjectType(sotref.id, true);
        if (!alreadyAssignedPrimary && sot.classification?.includes(SecondaryObjectTypeClassification.PRIMARY)) {
          this.fsot.applicableTypes.push(sot);
        } else if (!sot.classification?.includes(SecondaryObjectTypeClassification.REQUIRED)) {
          this.fsot.applicableSOTs.push(sot);
        }
      });
  }

  private isEditable(dmsObject: DmsObject): boolean {
    return dmsObject.hasOwnProperty('rights') && dmsObject.rights.writeIndexData;
  }

  chooseFSOT(isPrimaryFSOT?: boolean) {
    const popoverConfig: PopoverConfig = {
      maxHeight: '70%',
      data: {}
    };
    this.popoverService.open(isPrimaryFSOT ? this.tplFloatingTypePicker : this.tplFloatingSOTypePicker, popoverConfig);
  }

  applyFSOT(sot: SecondaryObjectType, isPrimaryFSOT: boolean, popoverRef?: PopoverRef) {
    this.busy = true;
    this.systemService.getObjectTypeForm(sot.id, Situation.EDIT).subscribe((formModel) => {
      if (this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]) {
        this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS].push(sot.id);
      } else {
        this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = [sot.id];
      }
      this.afoObjectForm.addForm(sot.id, formModel, {}, this.formDisabled || !this.isEditable(this._dmsObject), !isPrimaryFSOT);
      this.getApplicableSecondaries(this._dmsObject);
      this.busy = false;
      if (popoverRef) {
        popoverRef.close();
      }
    });
  }

  removeSOT(id: string) {
    if (
      this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] &&
      this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS].includes(id)
    ) {
      this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS].filter(
        (sot) => sot !== id
      );
      this.afoObjectForm.removeForm(id);
      this.getApplicableSecondaries(this._dmsObject);
    }
  }

  ngOnDestroy() {}
}
