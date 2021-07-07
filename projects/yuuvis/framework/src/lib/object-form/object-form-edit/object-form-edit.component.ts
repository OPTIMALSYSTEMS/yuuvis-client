import { Attribute, Component, EventEmitter, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  AFO_STATE,
  ApiBase,
  ApplicableSecondaries,
  BackendService,
  BaseObjectTypeField,
  DmsObject,
  DmsService,
  ObjectTag,
  PendingChangesService,
  SecondaryObjectTypeClassification,
  SystemService,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { FloatingSotSelectInput, FloatingSotSelectItem } from '../../floating-sot-select/floating-sot-select.interface';
import { PopoverConfig } from '../../popover/popover.interface';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { CombinedFormAddInput, CombinedObjectFormComponent, CombinedObjectFormInput } from '../combined-object-form/combined-object-form.component';
import { NotificationService } from './../../services/notification/notification.service';
import { FormStatusChangedEvent } from './../object-form.interface';
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
  private _sourceDmsObject: DmsObject;
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

  // fsot: {
  //   applicableTypes: SelectableGroup;
  //   applicableSOTs: SelectableGroup;
  // };

  // Indicator that we are dealing with a floating object type
  // This kind of object will use a combination of multiple forms instaed of a single one
  // isFloatingObjectType: boolean;
  isExtendableObjectType: boolean;

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
    if (dmsObject && (!this._dmsObject || this._dmsObject !== dmsObject)) {
      // if (this.isFloatingObjectType || (dmsObject && (!this._dmsObject || this._dmsObject.id !== dmsObject.id))) {
      // reset the state of the form
      this.formState = null;
      this.controls.saving = false;
      this.controls.disabled = true;
      this._secondaryObjectTypeIDs = dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]
        ? [...dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]]
        : [];
      this.createObjectForm(dmsObject).subscribe();
    }
    this._dmsObject = dmsObject;
  }

  /**
   * Emits the updated `DmsObject` when a form has been saved.
   */
  @Output() indexDataSaved = new EventEmitter<DmsObject>();

  @Output() statusChanged = new EventEmitter<FormStatusChangedEvent>();

  combinedFormInput: CombinedObjectFormInput;
  formState: FormStatusChangedEvent;
  fsotSelectInputs: {
    primary: FloatingSotSelectInput;
    extension: FloatingSotSelectInput;
  };
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
    @Attribute('actionsDisabled') public actionsDisabled: boolean,
    @Attribute('situation') public situation: string = Situation.EDIT,
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
    if (!this.pendingChanges.hasPendingTask(this.pendingTaskId || ' ') && !this.actionsDisabled) {
      this.pendingTaskId = this.pendingChanges.startTask(this.translate.instant('yuv.framework.object-form-edit.pending-changes.alert'));
    }
  }

  private finishPending() {
    this.pendingChanges.finishTask(this.pendingTaskId);
  }

  onFormStatusChanged(evt) {
    this.statusChanged.emit(evt);
    this.formState = evt;
    this.controls.disabled = !(this.formState.dirty || this._sotChanged.assignedPrimaryFSOT);
    if (this.formState.dirty) {
      this.startPending();
    } else {
      this.finishPending();
    }
  }

  getFormData() {
    let formData = (this.objectForm || this.afoObjectForm).getFormData();
    // also apply secondary objecttype IDs as they may have changed as well
    if (this._sotChanged.applied.length > 0 || this._sotChanged.removed.length > 0) {
      formData[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS];
    }
    return formData;
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
            switchMap((updatedObject) => {
              this._dmsObject = updatedObject;
              if (this.combinedFormInput) {
                this._sotChanged = {
                  applied: [],
                  removed: [],
                  assignedPrimaryFSOT: false,
                  assignedGeneral: false
                };

                this._secondaryObjectTypeIDs = [...this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS]];
                this.afoObjectForm.setFormPristine();
                return this.createObjectForm(this._dmsObject);
              } else {
                return of(true);
              }
            }),
            finalize(() => this.finishPending())
          )
          .subscribe(
            () => {
              this.controls.saving = false;
              this.controls.disabled = true;
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
    return this.systemService.getObjectTypeForms(secondaryObjectTypeIDs, this.situation).pipe(
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
  resetForm() {
    if (this.objectForm) {
      this.objectForm.resetForm();
    }
    if (this.afoObjectForm) {
      this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = [...this._secondaryObjectTypeIDs];
      this._sotChanged.assignedGeneral = false;
      this.controls.disabled = true;
      this.createObjectForm(this._dmsObject).subscribe();
      this._sotChanged = {
        applied: [],
        removed: [],
        assignedPrimaryFSOT: false,
        assignedGeneral: false
      };
    }
  }

  private createObjectForm(dmsObject: DmsObject, validate?: boolean): Observable<any> {
    this.getApplicableSecondaries(dmsObject);
    return this.systemService.getDmsObjectForms(dmsObject, this.situation).pipe(
      map((res) => {
        this.combinedFormInput = {
          main: res.main,
          extensions: res.extensions,
          data: dmsObject.data,
          disabled: this.formDisabled || !this.isEditable(dmsObject),
          enableEditSOT: true
        };
        return true;
      })
    );
  }

  private getApplicableSecondaries(dmsObject: DmsObject) {
    const asots: ApplicableSecondaries = this.systemService.getApplicableSecondaries(dmsObject);
    this.fsotSelectInputs = {
      primary: {
        dmsObject: dmsObject,
        isPrimary: true,
        sots: asots.primarySOTs
      },
      extension: {
        dmsObject: dmsObject,
        sots: asots.extendingSOTs
      }
    };
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

  applyFSOT(fsot: FloatingSotSelectItem, isPrimaryFSOT: boolean, popoverRef?: PopoverRef) {
    this.busy = true;
    let sotsToBeAdded: string[] = [];
    let enableEditSOT = true;
    let sotIDs = this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] || [];

    if (isPrimaryFSOT) {
      // // primary and required FSOTs are not supposed to be edited (removed later on)
      enableEditSOT = false;
      // // also add required SOTs
      const rFSOTs = this.systemService.getRequiredFSOTs(this._dmsObject.objectTypeId).map((sot) => sot.id);
      sotsToBeAdded = [...rFSOTs];
      this._sotChanged.assignedPrimaryFSOT = true;
    }
    // add the selected FSOT
    // may be NULL if general type is selected
    if (fsot) {
      sotsToBeAdded.push(fsot.sot.id);
    } else {
      this._sotChanged.assignedGeneral = true;
    }
    this._dmsObject.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = [...sotIDs, ...sotsToBeAdded];

    if (isPrimaryFSOT) {
      this.createObjectForm(this._dmsObject).subscribe(() => (this.busy = false));
    } else {
      enableEditSOT =
        sotsToBeAdded.length === 1 &&
        !this.systemService.getSecondaryObjectType(sotsToBeAdded[0]).classification?.includes(SecondaryObjectTypeClassification.EXTENSION_REMOVE_FALSE);
      this.getCombinedFormAddInput(sotsToBeAdded, enableEditSOT).subscribe((res: CombinedFormAddInput[]) => {
        if (res.length > 0) {
          this.afoObjectForm.addForms(res, this._dmsObject.data);

          this.getApplicableSecondaries(this._dmsObject);
        }
        this.busy = false;
      });
    }
    this._sotChanged.applied = [...this._sotChanged.applied, ...sotsToBeAdded];
    this._sotChanged.removed = this._sotChanged.removed.filter((sotId) => !sotsToBeAdded.includes(sotId));
    this.controls.disabled = false;
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
