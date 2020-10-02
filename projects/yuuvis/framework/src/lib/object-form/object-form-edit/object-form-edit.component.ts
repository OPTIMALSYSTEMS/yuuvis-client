import { Component, EventEmitter, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  AFO_STATE,
  ApiBase,
  BackendService,
  BaseObjectTypeField,
  ContentStreamAllowed,
  DmsObject,
  DmsService,
  ObjectTag,
  PendingChangesService,
  SecondaryObjectType,
  SecondaryObjectTypeClassification,
  SystemService,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { Selectable, SelectableGroup } from '../../grouped-select';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { CombinedFormAddInput, CombinedObjectFormComponent, CombinedObjectFormInput } from '../combined-object-form/combined-object-form.component';
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

  // will be set once an SOT has been added or removed
  private _sotChanged = {
    // IDs of FSOTs that have been applied
    applied: [],
    // IDs of FSOTs that have been removed
    removed: [],
    // whether or not a primary FSOT has been applied
    assignedPrimaryFSOT: false,
    assignedGeneral: false
  };

  fsot: {
    // applicableTypes: SecondaryObjectType[];
    // applicableSOTs: SecondaryObjectType[];
    applicableTypes: SelectableGroup;
    applicableSOTs: SelectableGroup;
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
      this._secondaryObjectTypeIDs = dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]
        ? [...dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]]
        : [];
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
    private backend: BackendService,
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

    // this.pendingChanges.setCustomMessage(this.translate.instant('yuv.framework.object-form-edit.pending-changes.alert'));
  }

  private startPending() {
    // because this method will be called every time the form status changes,
    // pending task will only be started once until it was finished
    if (!this.pendingChanges.hasPendingTask(this.pendingTaskId || ' ')) {
      this.pendingTaskId = this.pendingChanges.startTask(this.translate.instant('yuv.framework.object-form-edit.pending-changes.alert'));
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
        // also apply secondary objecttype IDs as they may have changed as well
        if (this._sotChanged.applied.length > 0 || this._sotChanged.removed.length > 0) {
          formData[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS];
        }

        this.dmsService
          .updateDmsObject(this._dmsObject.id, formData)
          .pipe(
            switchMap((updatedObject) => {
              // update DLM tag when a primary FSOT has been applied
              return this._sotChanged.assignedPrimaryFSOT
                ? this.backend
                    .post(`/dms/objects/${updatedObject.id}/tags/${ObjectTag.AFO}/state/${AFO_STATE.READY}?overwrite=true`, {}, ApiBase.core)
                    .pipe(map((_) => updatedObject))
                : of(updatedObject);
            }),
            finalize(() => this.finishPending())
          )
          .subscribe(
            (updatedObject) => {
              this._dmsObject = updatedObject;
              if (this.formOptions) {
                this.formOptions.data = updatedObject.data;
                this.objectForm.setFormPristine();
              }
              if (this.combinedFormInput) {
                this._sotChanged = {
                  applied: [],
                  removed: [],
                  assignedPrimaryFSOT: false,
                  assignedGeneral: false
                };
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

  private getCombinedFormAddInput(secondaryObjectTypeIDs: string[], enableEditSOT = true): Observable<CombinedFormAddInput[]> {
    return this.systemService.getObjectTypeForms(secondaryObjectTypeIDs, Situation.EDIT).pipe(
      map((res: { [key: string]: any }) => {
        const fi: CombinedFormAddInput[] = [];
        Object.keys(res).forEach((k) => {
          fi.push({
            id: k,
            formModel: res[k],
            disabled: this.formDisabled || !this.isEditable(this._dmsObject),
            enableEditSOT: enableEditSOT
          });
        });
        return fi;
      })
    );
  }

  // reset the form to its initial state
  reset() {
    if (this.objectForm) {
      this.objectForm.resetForm();
    }
    if (this.afoObjectForm) {
      this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = [...this._secondaryObjectTypeIDs];

      // remove ids that are part of both arrays
      const remove = this._sotChanged.applied.filter((id) => !this._sotChanged.removed.includes(id));
      const add = this._sotChanged.removed.filter((id) => !this._sotChanged.applied.includes(id));

      this.afoObjectForm.removeForms(remove);

      if (add.length) {
        this.busy = true;
        this.getCombinedFormAddInput([this._dmsObject.data[BaseObjectTypeField.OBJECT_TYPE_ID], ...add], true).subscribe((res: CombinedFormAddInput[]) => {
          if (res.length > 0) {
            this.afoObjectForm.addForms(res, this._dmsObject.data);
            this.getApplicableSecondaries(this._dmsObject);
          }
          this._sotChanged = {
            applied: [],
            removed: [],
            assignedPrimaryFSOT: false,
            assignedGeneral: false
          };
          this.afoObjectForm.resetForm();
          this.busy = false;
        });
      } else {
        this._sotChanged = {
          applied: [],
          removed: [],
          assignedPrimaryFSOT: false,
          assignedGeneral: false
        };
        this.afoObjectForm.resetForm();
        this.getApplicableSecondaries(this._dmsObject);
      }
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
      applicableTypes: {
        id: 'type',
        label: this.translate.instant('yuv.framework.object-form-edit.fsot.apply-type'),
        items: []
      },
      applicableSOTs: {
        id: 'fsot',
        label: this.translate.instant('yuv.framework.object-form-edit.fsot.add-fsot'),
        items: []
      }
    };
    const currentSOTs = dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS];
    const alreadyAssignedPrimary =
      this._sotChanged.assignedGeneral ||
      (currentSOTs?.length > 0 &&
        currentSOTs
          .map((id) => this.systemService.getSecondaryObjectType(id))
          .filter((sot) => sot?.classification?.includes(SecondaryObjectTypeClassification.PRIMARY)).length > 0);

    this.systemService
      .getObjectType(dmsObject.objectTypeId)
      .secondaryObjectTypes.filter((sot) => !sot.static && !currentSOTs?.includes(sot.id))
      .forEach((sotref) => {
        const sot = this.systemService.getSecondaryObjectType(sotref.id, true);

        if (sot.classification?.includes(SecondaryObjectTypeClassification.PRIMARY)) {
          if (!alreadyAssignedPrimary) {
            this.fsot.applicableTypes.items.push(this.toSelectable(sot, dmsObject));
          }
        } else if (!sot.classification?.includes(SecondaryObjectTypeClassification.REQUIRED)) {
          this.fsot.applicableSOTs.items.push(this.toSelectable(sot, dmsObject));
        }
      });

    this.fsot.applicableSOTs.items.sort(Utils.sortValues('label'));

    if (!alreadyAssignedPrimary) {
      this.fsot.applicableTypes.items.sort(Utils.sortValues('label'));
      // add general target type
      this.fsot.applicableTypes.items = [
        {
          id: 'none',
          label: this.translate.instant('yuv.framework.object-create.afo.type.select.general'),
          description: this.systemService.getLocalizedResource(`${dmsObject.objectTypeId}_label`),
          svgSrc: this.systemService.getObjectTypeIconUri(dmsObject.objectTypeId)
        },
        ...this.fsot.applicableTypes.items
      ];
    }
  }

  private toSelectable(sot: SecondaryObjectType, dmsObject?: DmsObject): Selectable {
    // if we got files but the target FSOT does not support content
    const contentRequiredButMissing = !dmsObject?.content && sot.contentStreamAllowed === ContentStreamAllowed.REQUIRED;
    // if the target FSOT requires a file, but we don't have one
    const contentButNotAllowed = !!dmsObject?.content && sot.contentStreamAllowed === ContentStreamAllowed.NOT_ALLOWED;
    const disabled = contentRequiredButMissing || contentButNotAllowed;

    let selectable: Selectable = {
      id: sot.id,
      label: sot.label,
      svgSrc: this.systemService.getObjectTypeIconUri(sot.id),
      disabled: disabled,
      value: sot
    };
    // add description to tell the user why a selectable is disabled
    if (disabled) {
      selectable.description = contentRequiredButMissing
        ? this.translate.instant('yuv.framework.object-create.afo.type.select.disabled.content-missing')
        : this.translate.instant('yuv.framework.object-create.afo.type.select.disabled.content-not-allowed');
    }
    return selectable;
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
    let sotsToBeAdded = [];
    let enableEditSOT = true;
    let sotIDs = this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] || [];

    if (isPrimaryFSOT) {
      // primary and required FSOTs are not supposed to be edited (removed later on)
      enableEditSOT = false;
      // also add required SOTs
      const rFSOTs = this.systemService.getRequiredFSOTs(this._dmsObject.objectTypeId).map((sot) => sot.id);
      sotsToBeAdded = [...rFSOTs];
      this._sotChanged.assignedPrimaryFSOT = true;
    }
    // add the selected FSOT
    // may be NULL if general type is selected
    if (sot) {
      sotsToBeAdded.push(sot.id);
    } else {
      this._sotChanged.assignedGeneral = true;
    }
    this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = [...sotIDs, ...sotsToBeAdded];

    this.getCombinedFormAddInput(sotsToBeAdded, enableEditSOT).subscribe((res: CombinedFormAddInput[]) => {
      if (res.length > 0) {
        this.afoObjectForm.addForms(res, this._dmsObject.data);
        this.getApplicableSecondaries(this._dmsObject);
        this._sotChanged.applied = [...this._sotChanged.applied, ...sotsToBeAdded];
      }
      this.busy = false;
    });
    if (popoverRef) {
      popoverRef.close();
    }
  }

  removeFSOT(id: string) {
    if (
      this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] &&
      this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS].includes(id)
    ) {
      this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS].filter(
        (sot) => sot !== id
      );
      this.afoObjectForm.removeForms([id]);
      this._sotChanged.removed.push(id);
      this._sotChanged.applied = this._sotChanged.applied.filter((sotId) => id !== sotId);
      this.getApplicableSecondaries(this._dmsObject);
    }
  }

  ngOnDestroy() {}
}
