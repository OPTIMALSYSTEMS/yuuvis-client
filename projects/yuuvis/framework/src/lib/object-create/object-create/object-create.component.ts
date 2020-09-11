import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
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
  SearchService,
  SecondaryObjectType,
  SecondaryObjectTypeClassification,
  Sort,
  SystemService,
  SystemType,
  TranslateService,
  UserRoles,
  UserService,
  Utils,
  YuvUser
} from '@yuuvis/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { FadeInAnimations } from '../../common/animations/fadein.animation';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { SelectableGroup } from '../../grouped-select';
import { CombinedObjectFormComponent, CombinedObjectFormInput } from '../../object-form/combined-object-form/combined-object-form.component';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../object-form/object-form.interface';
import { Situation } from '../../object-form/object-form.situation';
import { ObjectFormComponent } from '../../object-form/object-form/object-form.component';
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
    items: SecondaryObjectType[];
    selected?: {
      sot: SecondaryObjectType;
      // may be more than one form model because it is a combination of multiple SOTs
      combinedFormInput: CombinedObjectFormInput;
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
@Component({
  selector: 'yuv-object-create',
  templateUrl: './object-create.component.html',
  styleUrls: ['./object-create.component.scss'],
  animations: [FadeInAnimations.fadeIn],
  providers: [ObjectCreateService]
})
export class ObjectCreateComponent implements OnDestroy {
  @ViewChild(ObjectFormComponent) objectForm: ObjectFormComponent;
  @ViewChild(CombinedObjectFormComponent) combinedObjectForm: CombinedObjectFormComponent;

  context: DmsObject;
  // whether or not the current user is allowed to use the component and create dms objects
  invalidUser: boolean;
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
      this.selectObjectType(objectType);
      this.formState = { ...this.formState, data };
    }
  }

  /**
   * ID of parent folder/context. Providing this ID will create the new object
   * inside this parent folder. Eventhough you specify the context, the user is
   * able to remove it. So this is more a suggestion.
   */
  @Input() set contextId(id: string) {
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
    private searchService: SearchService,
    private dmsService: DmsService,
    private backend: BackendService,
    private userService: UserService,
    private translate: TranslateService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([clear, navBack]);
    this.resetState();

    this.labels = {
      defaultTitle: this.translate.instant('yuv.framework.object-create.header.title'),
      allowed: this.translate.instant('yuv.framework.object-create.step.type.content.allowed'),
      notallowed: this.translate.instant('yuv.framework.object-create.step.type.content.notallowed'),
      required: this.translate.instant('yuv.framework.object-create.step.type.content.required')
    };
    this.title = this.labels.defaultTitle;

    this.userService.user$.subscribe((user: YuvUser) => {
      this.invalidUser = !user.authorities.includes(UserRoles.CREATE_OBJECT);
    });

    let i = 0;
    this.generalObjectTypeGroups = this.system
      .getGroupedObjectTypes()
      .map((otg: ObjectTypeGroup) => ({
        id: `${i++}`,
        label: otg.label,
        items: otg.types
          .filter(
            (ot) =>
              ![
                // types that should not be able to be created
                SystemType.FOLDER,
                SystemType.DOCUMENT
              ].includes(ot.id)
          )
          .map((ot: ObjectType) => ({
            id: ot.id,
            label: this.system.getLocalizedResource(`${ot.id}_label`),
            description: ot.isFolder ? '' : this.labels[ot.contentStreamAllowed],
            highlight: ot.isFolder,
            svgSrc: this.system.getObjectTypeIconUri(ot.id),
            value: ot
          }))
      }))
      .filter((group: SelectableGroup) => group.items.length > 0);
    this.setupAvailableObjectTypeGroups();
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
          items: g.items.map((i) => ({ ...i, disabled: this.files.length > 0 && i.value.contentStreamAllowed === ContentStreamAllowed.NOT_ALLOWED }))
        });
      });
      this.availableObjectTypeGroups = agFiltered;
    } else {
      this.availableObjectTypeGroups = ag;
    }
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

  // /**
  //  * Checks whether or not the given object type is an advanced filing object (AFO). These types have a special kind of
  //  * create lifecycle and treated in a different way.
  //  *
  //  * AFOs are object types that require a content stream and have a classification of 'appClient:dlm'. The object type itself
  //  * is required to have no mandatory properties, so the content can be uploaded without having to apply some indexdata.
  //  *
  //  * AFOs have at least one Secondary Object Type (SOT) that could be applied later on.
  //  *
  //  * @param objectType Object type to be checked
  //  */
  // private isAdvancedFilingObjectType(objectType: ObjectType): boolean {
  //   return this.system.isFloatingObjectType(objectType);
  //   // switch (objectType.contentStreamAllowed) {
  //   //   case ContentStreamAllowed.ALLOWED: {
  //   //     // optional file
  //   //     break;
  //   //   }
  //   //   case ContentStreamAllowed.NOT_ALLOWED: {
  //   //     // no file
  //   //     break;
  //   //   }
  //   //   case ContentStreamAllowed.REQUIRED: {
  //   //     // file mandatory
  //   //     break;
  //   //   }
  //   // }

  //   // return (
  //   //   objectType.contentStreamAllowed === ContentStreamAllowed.REQUIRED &&
  //   //   Array.isArray(objectType.classification) &&
  //   //   objectType.classification.includes(ObjectTypeClassification.ADVANCED_FILING_OBJECT)
  //   // );
  // }

  /**
   * Select an object type for the object to be created.
   * @param objectType The object type to be selected
   */
  selectObjectType(objectType: ObjectType) {
    this.formState = null;
    this.selectedObjectType = objectType;
    this.title = objectType ? this.system.getLocalizedResource(`${objectType.id}_label`) : this.labels.defaultTitle;
    this.objCreateService.setNewState({ busy: true });

    // if (this.isAdvancedFilingObjectType(objectType)) {
    //   // DLM object types are treated in a different way
    //   this.processAFOType(objectType);
    // } else

    if (this.system.isFloatingObjectType(objectType)) {
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

      if (this.afoType !== AFOType.CONTENT_NONE) {
        this.processAFOTypeWithoutFile();
      } else {
        this.processAFOTypeWithFile();
      }
    } else {
      this.afoType = null;
      this.system.getObjectTypeForm(objectType.id, 'CREATE').subscribe(
        (model) => {
          this.objCreateService.setNewState({ busy: false });
          this.selectedObjectTypeFormOptions = {
            formModel: model,
            data: {}
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
    this.objCreateService.setNewState({ currentStep: CurrentStep.FILES });
    this.objCreateService.setNewBreadcrumb(CurrentStep.FILES);
    this.objCreateService.setNewState({ busy: false, done: this.isReady() });
  }

  private processAFOTypeWithoutFile() {
    this.afoUploadApprove();
    // this.objCreateService.setNewState({ currentStep: CurrentStep.AFO_INDEXDATA });
    // this.objCreateService.setNewBreadcrumb(CurrentStep.AFO_INDEXDATA);
    // this.objCreateService.setNewState({ busy: false, done: this.isReady() });
  }

  afoSelectFloatingSOT(sot: SecondaryObjectType) {
    this.objCreateService.setNewState({ busy: true });
    const objectType = !!this.selectedObjectType.floatingParentType
      ? this.system.getObjectType(this.selectedObjectType.floatingParentType)
      : this.selectedObjectType;
    const objectTypeIDs = [];

    // main object type may not have own fields
    if (objectType.fields.filter((f) => !f.id.startsWith('system:')).length) {
      objectTypeIDs.push(objectType.id);
    }

    // required SOTs will also be applied
    objectType.secondaryObjectTypes
      .filter((otSot) => !otSot.static)
      .forEach((otSot) => {
        const t = this.system.getSecondaryObjectType(otSot.id);
        if (t.fields.length > 0 && t.classification && t.classification.includes(SecondaryObjectTypeClassification.REQUIRED)) {
          objectTypeIDs.push(t.id);
        }
      });

    this.system.getObjectTypeForms([...objectTypeIDs, sot.id], Situation.CREATE).subscribe(
      (res) => {
        this.afoCreate.floatingSOT.selected = {
          sot: sot,
          // TODO: also apply extraction data here
          // TODO: If object is changed form should also get new data
          combinedFormInput: {
            formModels: res,
            data: this.afoCreate?.dmsObject.items.length === 1 ? this.afoCreate.dmsObject.selected.data : {}
          }
        };
        this.objCreateService.setNewState({ busy: false });
      },
      (err) => {
        this.objCreateService.setNewState({ busy: false });
      }
    );
  }

  afoUploadApprove() {
    let data = {};
    if (this.context) {
      data[BaseObjectTypeField.PARENT_ID] = this.context.id;
    }
    data[BaseObjectTypeField.TAGS] = [[ObjectTag.AFO, AFO_STATE.IN_PROGRESS]];
    // this.busy = true;

    this.objCreateService.setNewState({ busy: true });

    this.createObject(this.selectedObjectType.floatingParentType || this.selectedObjectType.id, data, this.files)
      .pipe(
        takeUntilDestroy(this),
        switchMap((res: string[]) => this.dmsService.getDmsObjects(res))
      )
      .subscribe(
        (res: DmsObject[]) => {
          this.objCreateService.setNewState({ currentStep: CurrentStep.AFO_INDEXDATA, busy: false });
          this.objCreateService.setNewBreadcrumb(CurrentStep.AFO_INDEXDATA, CurrentStep.AFO_UPLOAD);

          if (this.selectedObjectType.floatingParentType) {
            // floating types
            const sot = this.system.getSecondaryObjectType(this.selectedObjectType.id);
            const selectableSOTs = this.system
              .getPrimaryFSOTs(this.selectedObjectType.id, true)
              .filter((sot) => !sot.classification || !sot.classification.includes(SecondaryObjectTypeClassification.REQUIRED));
            this.afoCreate = {
              dmsObject: { items: res, selected: res[0] },
              floatingSOT: { items: selectableSOTs }
            };
            this.afoSelectFloatingSOT(sot);
          } else {
            const selectableSOTs = this.system
              .getPrimaryFSOTs(this.selectedObjectType.id, true)
              .filter((sot) => !sot.classification || !sot.classification.includes(SecondaryObjectTypeClassification.REQUIRED));
            this.afoCreate = {
              dmsObject: { items: res, selected: res[0] },
              floatingSOT: { items: selectableSOTs }
            };
            if (selectableSOTs.length === 1) {
              this.afoSelectFloatingSOT(selectableSOTs[0]);
            }
          }
        },
        (err) => {
          this.objCreateService.setNewState({ busy: false });
          this.notify.error(this.translate.instant('yuv.framework.object-create.notify.error'));
        }
      );
  }

  afoUploadCancel() {
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

  onFilesDroppedOnType(files: File[], type?: ObjectType) {
    if (type) {
      this.selectObjectType(type);
    }
    this.files = [...this.files, ...files];
    this.objCreateService.setNewState({ done: this.isReady() });
  }

  fileSelectContinue() {
    const nextStep = !this.afoType ? CurrentStep.INDEXDATA : CurrentStep.AFO_UPLOAD;
    this.goToStep(nextStep);
    this.objCreateService.setNewBreadcrumb(nextStep);
  }

  private createObject(id: string, data: any, files: File[], silent = false): Observable<string[]> {
    return this.dmsService.createDmsObject(id, data, files, files.map((file) => file.name).join(', '), silent);
  }

  create() {
    let data = this.formState.data;
    if (this.context) {
      data[BaseObjectTypeField.PARENT_ID] = this.context.id;
    }
    this.objCreateService.setNewState({ busy: true });

    // const isAFO = this.isAdvancedFilingObjectType(this.selectedObjectType) || !!this.selectedObjectType.floatingParentType;
    (!!this.afoType ? this.createAFO(data) : this.createDefault(data)).subscribe(
      (ids: string[]) => {
        this.objCreateService.setNewState({ busy: false });
        // this.notify.success(this.translate.instant('yuv.framework.object-create.notify.success'));
        if (this.createAnother || this.afoCreate?.dmsObject.selected) {
          this.selectedObjectType = null;
          this.files = [];
          this.resetState();
          this.reset();
        } else {
          this.objectCreated.emit(ids);
        }
      },
      (err) => {
        this.objCreateService.setNewState({ busy: false });
        this.notify.error(this.translate.instant('yuv.framework.object-create.notify.error'));
      }
    );
  }

  createAfoCancel() {
    this.notify.info(this.translate.instant('yuv.framework.object-create.notify.afo.cancel'));
    this.selectedObjectType = null;
    this.files = [];
    this.resetState();
    this.reset();
  }

  /**
   * Finish creation of an AFO
   * @param data Data to be allied to the object
   * @returns List of IDs of finished objects
   */
  private createAFO(data: any): Observable<string[]> {
    const objectType = !!this.selectedObjectType.floatingParentType
      ? this.system.getObjectType(this.selectedObjectType.floatingParentType)
      : this.selectedObjectType;
    // add selected SOTs
    const sotsToBeApplied: string[] = objectType.secondaryObjectTypes
      .filter((sot) => {
        const soType = this.system.getSecondaryObjectType(sot.id);
        // add static as well as required SOTs
        return sot.static || (soType.classification && soType.classification.includes(SecondaryObjectTypeClassification.REQUIRED));
      })
      .map((sot) => sot.id);
    // add the chosen type as well
    sotsToBeApplied.push(this.afoCreate.floatingSOT.selected.sot.id);
    data[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = sotsToBeApplied;

    // update existing dms object
    return forkJoin(
      this.afoCreate.dmsObject.items.map((dmsObject) =>
        this.dmsService.updateDmsObject(dmsObject.id, data).pipe(
          // update system tags
          switchMap((dmsObject: DmsObject) =>
            this.backend
              .post(`/dms/objects/${dmsObject.id}/tags/${ObjectTag.AFO}/state/${AFO_STATE.READY}?overwrite=true`, {}, ApiBase.core)
              .pipe(map((_) => of(dmsObject)))
          ),
          catchError((e) => {
            return of(null);
          })
        )
      )
    );
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
    this.afoCreate = null;
    this.objCreateService.resetState();
    this.objCreateService.resetBreadcrumb();
  }

  reset() {
    this.formState = null;
    (this.afoCreate ? this.combinedObjectForm : this.objectForm)?.resetForm();
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
