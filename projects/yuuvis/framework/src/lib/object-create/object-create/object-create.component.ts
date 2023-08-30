import { Component, EventEmitter, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  AFO_STATE,
  ApiBase,
  BackendService,
  BaseObjectTypeField,
  ContentStreamAllowed,
  DmsObject,
  DmsService,
  ObjectTag,
  ObjectType,
  ObjectTypeGroup,
  PendingChangesService,
  SecondaryObjectTypeClassification,
  Sort,
  SystemService,
  SystemType,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { FadeInAnimations } from '../../common/animations/fadein.animation';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { FloatingSotSelectInput } from '../../floating-sot-select/floating-sot-select.interface';
import { Selectable, SelectableGroup } from '../../grouped-select';
import { ObjectFormEditComponent } from '../../object-form/object-form-edit/object-form-edit.component';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../object-form/object-form.interface';
import { ObjectFormComponent } from '../../object-form/object-form/object-form.component';
import { PopoverService } from '../../popover/popover.service';
import { LayoutService } from '../../services/layout/layout.service';
import { NotificationService } from '../../services/notification/notification.service';
import { clear, navBack } from '../../svg.generated';
import { ObjectCreateService } from '../object-create.service';
import { Breadcrumb, CreateState, CurrentStep, Labels, ObjectTypePreset } from './../object-create.interface';

// Interface used for creating special AFOs (Advanced filing objects).
export interface AFOState {
  // The AFOs that have been created
  dmsObject: {
    items: DmsObject[];
    selected?: DmsObject;
  };
  // List of floating secondary object types that could be applied to the current AFO(s)
  floatingSOT: {
    item: FloatingSotSelectInput;
    selected?: {
      sot: { id: string; label: string };
    };
  };
}

// Type of AFO
export enum AFOType {
  CONTENT_OPTIONAL = 'afo:content:optional',
  CONTENT_REQUIRED = 'afo:content:required',
  CONTENT_NONE = 'afo:content:none'
}

/**
 * This component is basically a wizard for creating new dms objects.
 * There are two kinds of processes that are supported:
 *
 * 1. Regular
 * Objects are created once all data is collected on the client side. The object is stored
 * after the user addes document files and indexdata.
 *
 * 2. Advanced filing
 * There are object types that support an advanced filing process. They have no required
 * indexdata fields and contain a set of floating secondary object types that could be
 * applied to them later on.
 * The document files are uploaded immediately. Some pre-processing tasks will analyse
 * the files and provide some support regarding classification and indexdata extraction.
 * Once this is done, the user is promted to choose one of the floating SOTs in order to
 * apply indexdata to the dms object.
 *
 * [Screenshot](../assets/images/yuv-object-create.gif)
 *
 * @example
 * <yuv-object-create></yuv-object-create>
 */
@UntilDestroy()
@Component({
  selector: 'yuv-object-create',
  templateUrl: './object-create.component.html',
  styleUrls: ['./object-create.component.scss'],
  animations: [FadeInAnimations.fadeIn],
  providers: [ObjectCreateService]
})
export class ObjectCreateComponent implements OnDestroy {
  private LAYOUT_OPTIONS_KEY = 'yuv.framework.object-create';
  private LAYOUT_OPTIONS_ELEMENT_KEY = 'yuv-object-create';

  @ViewChild(ObjectFormComponent) objectForm: ObjectFormComponent;
  @ViewChild(ObjectFormEditComponent) objectFormEdit: ObjectFormEditComponent;
  @ViewChild('cancelOverlay') cancelOverlay: TemplateRef<any>;

  private pendingTaskId: string;
  context: DmsObject;
  animationTimer = { value: true, params: { time: '400ms' } };
  // state of creation progress
  state$: Observable<CreateState> = this.objCreateService.state$;
  breadcrumb$: Observable<Breadcrumb[]> = this.objCreateService.breadcrumb$;

  // busy: boolean = false;
  createAnother: boolean = false;
  selectedObjectType: ObjectType;
  selectedObjectTypeFormOptions: ObjectFormOptions;

  afoType: AFOType;
  afoCreate: AFOState;
  afoUploadNoticeSkip: boolean;

  // groups of object types available for the root target
  generalObjectTypeGroups: SelectableGroup[];
  // groups of object types available for a context
  contextObjectTypeGroups: SelectableGroup[];

  availableObjectTypeGroups: SelectableGroup[];
  formState: FormStatusChangedEvent;
  _files: File[] = [];
  labels: Labels;
  title: string;

  @Input()
  set objectTypePreset(preset: ObjectTypePreset) {
    if (preset) {
      const { objectType, data } = preset;
      this.selectObjectType(objectType, data);
      this.formState = { ...this.formState, data };
    }
  }

  /**
   * ID of parent folder/context. Providing this ID will create the new object
   * inside this parent folder. Eventhough you specify the context, the user is
   * able to remove it. So this is more a suggestion.
   */
  @Input()
  set contextId(id: string) {
    if (id) {
      this.objCreateService.setNewState({ busy: true });
      this.dmsService.getDmsObject(id).subscribe(
        (res: DmsObject) => {
          this.context = res;
          this.setupContextTypeGroups();
          this.objCreateService.setNewState({ busy: false });
        },
        (err) => this.objCreateService.setNewState({ busy: false })
      );
    } else {
      this.context = null;
    }
  }

  /**
   * Files that should be used for creating object(s)
   */
  @Input() set files(files: File[]) {
    if (files) {
      this._files = files || [];
      this.setupAvailableObjectTypeGroups();
    }
  }

  get files(): File[] {
    return this._files;
  }

  /**
   * Emitts IDs of objects that have been created
   */
  @Output() objectCreated = new EventEmitter<string[]>();

  constructor(
    private objCreateService: ObjectCreateService,
    private system: SystemService,
    private notify: NotificationService,
    private dmsService: DmsService,
    private pendingChanges: PendingChangesService,
    private layoutService: LayoutService,
    private backend: BackendService,
    private translate: TranslateService,
    private popoverService: PopoverService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([clear, navBack]);
    this.resetState();

    this.layoutService.loadLayoutOptions(this.LAYOUT_OPTIONS_KEY, this.LAYOUT_OPTIONS_ELEMENT_KEY).subscribe((o: any) => {
      this.afoUploadNoticeSkip = o?.afoUploadNoticeSkip || false;
    });

    this.labels = {
      defaultTitle: this.translate.instant('yuv.framework.object-create.header.title'),
      allowed: this.translate.instant('yuv.framework.object-create.step.type.content.allowed'),
      notallowed: this.translate.instant('yuv.framework.object-create.step.type.content.notallowed'),
      required: this.translate.instant('yuv.framework.object-create.step.type.content.required')
    };
    this.title = this.labels.defaultTitle;

    let i = 0;
    this.generalObjectTypeGroups = this.system
      .getGroupedObjectTypes(false, true, false, 'create')
      .map((otg: ObjectTypeGroup) => ({
        id: `${i++}`,
        label: otg.label,
        items: otg.types
          .filter((ot) => ![SystemType.FOLDER, SystemType.DOCUMENT].includes(ot.id)) // types that should not be able to be created
          .map((ot: ObjectType) => ({
            id: ot.id,
            label: this.system.getLocalizedResource(`${ot.id}_label`) || ot.id,
            description: ot.isFolder ? '' : this.labels[ot.contentStreamAllowed],
            highlight: ot.isFolder,
            svgSrc: this.system.getObjectTypeIconUri(ot.id),
            value: ot
          }))
      }))
      .filter((group: SelectableGroup) => group.items.length > 0);
    this.setupAvailableObjectTypeGroups();
  }

  private startPending() {
    if (!this.pendingChanges.hasPendingTask(this.pendingTaskId || ' ')) {
      this.pendingTaskId = this.pendingChanges.startTask(this.translate.instant('yuv.framework.object-create.pending-changes.alert'));
    }
  }

  private finishPending() {
    if (this.pendingTaskId) {
      this.pendingChanges.finishTask(this.pendingTaskId);
    }
  }

  private setupAvailableObjectTypeGroups() {
    // it is important to create new instances of the available object types
    // in order to trigger change detection within grouped select component
    const agFiltered = [];
    const ag = this.context ? this.contextObjectTypeGroups : this.generalObjectTypeGroups;
    ag.map((groupItem) => groupItem?.items.sort(Utils.sortValues('label')).sort(Utils.sortValues('value.isFolder', Sort.DESC)));
    if (this.files) {
      // if we got files we also need to disable items that do not support contents
      ag.forEach((g: SelectableGroup) => {
        agFiltered.push({
          ...g,
          items: g.items.map((i) => ({ ...i, disabled: this.isDisabled(i) }))
        });
      });
      this.availableObjectTypeGroups = agFiltered;
    } else {
      this.availableObjectTypeGroups = ag;
    }
  }

  private isDisabled(item: Selectable) {
    const ot: ObjectType = item.value as ObjectType;
    return (
      (this.files.length > 0 && item.value.contentStreamAllowed === ContentStreamAllowed.NOT_ALLOWED) ||
      // floating and general types only support one file for now
      (!!ot.floatingParentType && this.files.length > 1) ||
      (this.system.isFloatingObjectType(ot) && this.files.length > 1)
    );
  }

  removeContext() {
    this.contextId = null;
    this.setupAvailableObjectTypeGroups();
  }

  removeFiles() {
    this.files = [];
  }

  goToStep(step: CurrentStep) {
    this.objCreateService.setNewState({ currentStep: step });
    if (step === CurrentStep.INDEXDATA && this.formState) {
      this.selectedObjectTypeFormOptions.data = this.formState.data;
    }
    if (step === CurrentStep.OBJECTTYPE) {
      this.afoCreate = null;
    }
  }

  /**
   * Select an object type for the object to be created.
   * @param objectType The object type to be selected
   * @param presetData Data that should be past to the form upfront
   */
  selectObjectType(objectType: ObjectType, presetData?: { [key: string]: any }) {
    this.formState = null;

    if (this.selectedObjectType && this.selectedObjectType.id !== objectType.id) {
      this.resetState();
    }
    this.startPending();
    this.selectedObjectType = objectType;
    this.title = objectType ? this.system.getLocalizedResource(`${objectType.id}_label`) || objectType.id : this.labels.defaultTitle;
    this.objCreateService.setNewState({ busy: true });

    if (!!objectType.floatingParentType || this.system.isFloatingObjectType(objectType)) {
      // setup the type of AFO we are processing
      switch (objectType.contentStreamAllowed) {
        case ContentStreamAllowed.ALLOWED: {
          // optional file
          this.afoType = AFOType.CONTENT_OPTIONAL;
          break;
        }
        case ContentStreamAllowed.NOT_ALLOWED: {
          // no file
          this.afoType = AFOType.CONTENT_NONE;
          break;
        }
        case ContentStreamAllowed.REQUIRED: {
          // file mandatory
          this.afoType = AFOType.CONTENT_REQUIRED;
          break;
        }
      }

      if (this.afoType === AFOType.CONTENT_NONE) {
        this.processAFOTypeWithoutFile();
      } else {
        this.processAFOTypeWithFile();
      }
    } else {
      this.afoType = null;
      this.system.getObjectTypeForm(objectType.id, 'CREATE').subscribe(
        (model) => {
          this.objCreateService.setNewState({ busy: false });
          let data = presetData || {};
          if (this.context) {
            data[BaseObjectTypeField.PARENT_ID] = this.context.id;
          }
          this.selectedObjectTypeFormOptions = {
            formModel: model,
            data: data
          };
          // does selected type support contents?
          if (objectType.isFolder || objectType.contentStreamAllowed === 'notallowed') {
            this.objCreateService.setNewState({ currentStep: CurrentStep.INDEXDATA });
            this.objCreateService.setNewBreadcrumb(CurrentStep.INDEXDATA, CurrentStep.FILES);
          } else {
            this.objCreateService.setNewState({ currentStep: CurrentStep.FILES });
            this.objCreateService.setNewBreadcrumb(CurrentStep.FILES, CurrentStep.INDEXDATA);
          }
          this.objCreateService.setNewState({ done: this.isReady() });
        },
        (err) => {
          this.objCreateService.setNewState({
            busy: false,
            done: this.isReady()
          });
          this.notify.error(this.title, this.translate.instant('yuv.framework.object-create.step.objecttype.form.fail'));
        }
      );
    }
  }

  private processAFOTypeWithFile() {
    this.objCreateService.setNewState({
      currentStep: CurrentStep.FILES,
      busy: false,
      done: this.isReady()
    });
    this.objCreateService.setNewBreadcrumb(CurrentStep.FILES);
  }

  private processAFOTypeWithoutFile() {
    this.afoCreateApprove();
  }

  afoSelectFloatingSOT(sot: { id: string; label: string }, data?: any) {
    if (data) {
      this.afoCreate.dmsObject.selected.data = { ...this.afoCreate.dmsObject.selected.data, ...data };
    }
    this.afoCreate.dmsObject.selected.data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] =
      !sot || sot.id != 'none' ? [...this.getSotsToBeApplied(), sot.id] : null;
    this.afoCreate.floatingSOT.selected = {
      sot: {
        id: sot?.id || 'none',
        label: sot?.label || this.selectedObjectType.label || sot?.id
      }
    };
  }

  afoCreateApprove(afoUploadNoticeSkip?: boolean) {
    if (afoUploadNoticeSkip) {
      this.layoutService
        .saveLayoutOptions(this.LAYOUT_OPTIONS_KEY, this.LAYOUT_OPTIONS_ELEMENT_KEY, {
          afoUploadNoticeSkip: true
        })
        .subscribe();
    }

    let data = {};
    if (this.context) {
      data[BaseObjectTypeField.PARENT_ID] = this.context.id;
    }
    data[BaseObjectTypeField.TAGS] = [[ObjectTag.AFO, AFO_STATE.IN_PROGRESS]];
    // this.busy = true;

    this.objCreateService.setNewState({ busy: true });

    this.createObject(this.selectedObjectType.floatingParentType || this.selectedObjectType.id, data, this.files)
      .pipe(
        untilDestroyed(this),
        switchMap((res: string[]) => this.dmsService.getDmsObjects(res))
      )
      .subscribe({
        next: (res: DmsObject[]) => {
          this.objCreateService.setNewState({ currentStep: CurrentStep.AFO_INDEXDATA, busy: false });
          this.objCreateService.setNewBreadcrumb(CurrentStep.AFO_INDEXDATA, CurrentStep.AFO_UPLOAD);

          const selectableSOTs: FloatingSotSelectInput = {
            dmsObject: res.length === 1 ? res[0] : null,
            sots: this.system.getPrimaryFSOTs(this.selectedObjectType.id, true).sort(Utils.sortValues('label')),
            additionalItems: [
              {
                label: this.translate.instant('yuv.framework.object-create.afo.type.select.general'),
                description: this.system.getLocalizedResource(`${this.selectedObjectType.id}_label`),
                svgSrc: this.system.getObjectTypeIconUri(this.selectedObjectType.id),
                sot: {
                  id: 'none',
                  baseId: null,
                  description: null,
                  fields: []
                }
              }
            ],
            isPrimary: true
          };

          if (this.selectedObjectType.floatingParentType) {
            // floating types
            const sot = this.system.getSecondaryObjectType(this.selectedObjectType.id);
            this.afoCreate = {
              dmsObject: { items: res, selected: res[0] },
              floatingSOT: { item: selectableSOTs }
            };
            this.afoSelectFloatingSOT({ id: sot.id, label: sot.label || sot.id });
          } else {
            this.afoCreate = {
              dmsObject: { items: res, selected: res[0] },
              floatingSOT: { item: selectableSOTs }
            };
            if (selectableSOTs.sots.length === 1) {
              this.afoSelectFloatingSOT({ id: selectableSOTs.sots[0].id, label: selectableSOTs.sots[0].label || selectableSOTs.sots[0].id });
            }
          }
        },
        error: (e) => this.onCreateError(e)
      });
  }

  afoCreateCancel() {
    this.resetState();
  }

  fileChosen(files: File[]) {
    this.files = [...this.files, ...files];
    this.objCreateService.setNewState({ done: this.isReady() });
  }

  filesClear() {
    this.files = [];
    this.objCreateService.setNewState({ done: this.isReady() });
  }

  removeFile(file: File, fileIndex: number) {
    this.files.splice(fileIndex, 1);
    this.objCreateService.setNewState({ done: this.isReady() });
  }

  onFilesDroppedOnType(files: File[]) {
    this.files = [...this.files, ...files];
    this.objCreateService.setNewState({ done: this.isReady() });
  }

  fileSelectContinue() {
    let nextStep;
    if (this.afoType) {
      // document file required
      if (this.afoType === AFOType.CONTENT_REQUIRED) {
        nextStep = CurrentStep.AFO_UPLOAD;
      }
      // document file is not neccessary
      if (this.afoType === AFOType.CONTENT_OPTIONAL) {
        if (!this.files || this.files.length === 0) {
          this.afoCreateApprove();
        } else {
          nextStep = CurrentStep.AFO_UPLOAD;
        }
      }
    } else {
      nextStep = CurrentStep.INDEXDATA;
    }
    if (nextStep) {
      if (nextStep === CurrentStep.AFO_UPLOAD && this.afoUploadNoticeSkip) {
        this.afoCreateApprove();
      } else {
        this.goToStep(nextStep);
        this.objCreateService.setNewBreadcrumb(nextStep);
      }
    }
  }

  private createObject(id: string, data: any, files: File[], silent = false): Observable<string[]> {
    return this.dmsService.createDmsObject(id, data, files, files.map((file) => file.name).join(', '), silent);
  }

  create() {
    let data = (this.objectForm || this.objectFormEdit).getFormData();
    if (this.context) {
      data[BaseObjectTypeField.PARENT_ID] = this.context.id;
    }
    this.objCreateService.setNewState({ busy: true });

    (!!this.afoType ? this.finishAFO(data) : this.createDefault(data)).subscribe({
      next: (ids: string[]) => {
        this.objCreateService.setNewState({ busy: false });
        if (this.createAnother) {
          this.selectedObjectType = null;
          this.files = [];
          this.resetState();
          this.reset();
        } else {
          this.finishPending();
          this.objectCreated.emit(ids);
        }
      },
      error: (e) => this.onCreateError(e)
    });
  }

  private onCreateError(err: any) {
    this.objCreateService.setNewState({ busy: false });
    this.notify.error(this.translate.instant('yuv.framework.object-create.notify.error'), err.message);
  }

  openCancelDialog() {
    if (!this.popoverService.hasActiveOverlay) {
      this.popoverService.open(this.cancelOverlay, {});
    }
  }

  closeCancelDialog(popover) {
    popover.close();
  }

  createAfoCancel(withDelete = false) {
    (withDelete ? this.deleteObjects() : this.finishAFO({})).subscribe(() => {
      this.selectedObjectType = null;
      this.files = [];
      this.resetState();
      this.reset();
    });
  }

  private deleteObjects(): Observable<any> {
    this.objCreateService.setNewState({ busy: true });
    return forkJoin(
      this.afoCreate.dmsObject.items.map((item) =>
        this.dmsService.deleteDmsObject(item.id).pipe(
          catchError((err) => {
            this.objCreateService.setNewState({ busy: false });
            this.notify.error(this.translate.instant('yuv.framework.object-create.notify.afo.cancel.with-delete.error'));
            return of(null);
          }),
          finalize(() => this.objCreateService.setNewState({ busy: false }))
        )
      )
    );
  }

  /**
   * Finish creation of an AFO
   * @param data Data to be allied to the object
   * @returns List of IDs of finished objects
   */
  private finishAFO(data: any): Observable<string[]> {
    const sotsToBeApplied = this.getSotsToBeApplied();
    const pFSOT = this.afoCreate?.floatingSOT?.selected;
    if (pFSOT && pFSOT.sot.id !== 'none') {
      sotsToBeApplied.push(pFSOT.sot.id);
    }
    data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = [...(data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] || []), ...sotsToBeApplied];

    // update existing dms object
    return forkJoin(
      this.afoCreate.dmsObject.items.map((dmsObject) =>
        this.dmsService.updateDmsObject(dmsObject.id, data).pipe(
          // update system tags
          switchMap((dmsObject: DmsObject) =>
            this.backend
              .post(`/dms/objects/${dmsObject.id}/tags/${ObjectTag.AFO}/state/${AFO_STATE.READY}?overwrite=true`, {}, ApiBase.core)
              .pipe(map((_) => dmsObject.id))
          ),
          catchError((e) => {
            return of(null);
          })
        )
      )
    );
  }

  private getSotsToBeApplied(): string[] {
    const objectType = !!this.selectedObjectType.floatingParentType
      ? this.system.getObjectType(this.selectedObjectType.floatingParentType)
      : this.selectedObjectType;
    // add selected SOTs
    return objectType.secondaryObjectTypes
      .filter((sot) => {
        const soType = this.system.getSecondaryObjectType(sot.id);
        // add static as well as required SOTs
        return sot.static || (soType.classification && soType.classification.includes(SecondaryObjectTypeClassification.REQUIRED));
      })
      .map((sot) => sot.id);
  }

  /**
   * Create an object the default way (not an AFO)
   * @param data Data to be allied to the object
   * @returns List of IDs of created objects
   */
  private createDefault(data: any): Observable<string[]> {
    return this.createObject(this.selectedObjectType.id, data, this.files);
  }

  resetState() {
    if (this.files.length) {
      this.files = [];
    }
    this.title = this.labels?.defaultTitle;
    this.afoCreate = null;
    this.selectedObjectType = null;
    this.objCreateService.resetState();
    this.objCreateService.resetBreadcrumb();
    this.finishPending();
  }

  reset() {
    this.formState = null;
    (this.afoCreate ? this.objectFormEdit : this.objectForm)?.resetForm();
  }

  onFormStatusChanged(evt) {
    this.formState = evt;
    this.objCreateService.setNewState({ done: this.isReady() });
  }

  // Set up object types that are available for the given context
  private setupContextTypeGroups() {
    this.contextObjectTypeGroups = this.generalObjectTypeGroups.map((g) => {
      // TODO: figure out which types are available based on the schema
      // right now we are just filtering out the folders ...
      return { ...g, items: g.items.filter((t) => !t.highlight) };
    });
    this.setupAvailableObjectTypeGroups();
  }

  /**
   * Checks whether or not all requirements are met to create a new object.
   */
  private isReady() {
    const typeSelected = !!this.selectedObjectType;
    let fileSelected = false;
    if (typeSelected) {
      switch (this.selectedObjectType.contentStreamAllowed) {
        case 'required': {
          fileSelected = !!this.afoCreate?.dmsObject.selected || this.files.length > 0;
          break;
        }
        case 'notallowed': {
          fileSelected = this.files.length === 0;
          break;
        }
        case 'allowed': {
          fileSelected = true;
          break;
        }
      }
    }
    return typeSelected && fileSelected && !!this.formState && !this.formState.invalid;
  }

  ngOnDestroy() {}
}
