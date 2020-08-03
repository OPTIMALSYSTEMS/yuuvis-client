import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import {
  BaseObjectTypeField,
  ContentStreamAllowed,
  DmsObject,
  DmsService,
  ObjectType,
  ObjectTypeGroup,
  SearchQuery,
  SearchResult,
  SearchResultItem,
  SearchService,
  SecondaryObjectType,
  Sort,
  SystemService,
  SystemType,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { FadeInAnimations } from '../../common/animations/fadein.animation';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { SelectableGroup } from '../../grouped-select';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../object-form/object-form.interface';
import { ObjectFormComponent } from '../../object-form/object-form/object-form.component';
import { NotificationService } from '../../services/notification/notification.service';
import { clear, navBack } from '../../svg.generated';
import { ObjectCreateService } from '../object-create.service';
import { Breadcrumb, CreateState, CurrentStep, Labels, ObjectTypePreset } from './../object-create.interface';

// Interface used for creating special DLM objects.
export interface DLMState {
  // The DLM objects that have been created
  dmsObject: {
    items: DmsObject[];
    selected?: DmsObject;
  };
  // List of floating secondary object types that could be applied to the current DLM(s)
  floatingSOT: {
    items: SecondaryObjectType[];
    selected?: SecondaryObjectType;
  };
}

/**
 * This component is basically a wizard for creating new dms objects.
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

  private DLM_CLASSIFIER = 'appClient:dlm';
  private DLM_TAG = 'appClient:dlm:prepare';
  // possible states of a DLM item
  private DLM_STATE = {
    // created but no FSOT assigned so far
    IN_PROGRESS: 0,
    // an FSOT has been assigned
    READY: 1
  };
  context: DmsObject;

  animationTimer = { value: true, params: { time: '400ms' } };
  // state of creation progress
  state$: Observable<CreateState> = this.objCreateServcice.state$;
  breadcrumb$: Observable<Breadcrumb[]> = this.objCreateServcice.breadcrumb$;

  busy: boolean = false;
  createAnother: boolean = false;
  selectedObjectType: ObjectType;
  selectedObjectTypeFormOptions: ObjectFormOptions;

  dlmCreate: DLMState;
  // list of DLM objects that have not been finished yet
  unfinishedDLM: any[];

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
      this.busy = true;
      this.dmsService.getDmsObject(id).subscribe(
        (res: DmsObject) => {
          this.context = res;
          this.setupContextTypeGroups();
          this.busy = false;
        },
        (err) => (this.busy = false)
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
   * Emits the IDs of the objects that have been created
   */
  @Output() objectCreated = new EventEmitter<string[]>();

  constructor(
    private objCreateServcice: ObjectCreateService,
    private system: SystemService,
    private notify: NotificationService,
    private searchService: SearchService,
    private dmsService: DmsService,
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

    let i = 0;
    this.generalObjectTypeGroups = this.system.getGroupedObjectTypes().map((otg: ObjectTypeGroup) => ({
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
          svg: this.system.getObjectTypeIcon(ot.id),
          value: ot
        }))
    }));
    this.setupAvailableObjectTypeGroups();
    this.collectUnfinishedDLMs();
  }

  // Get all DLMs that have ot been finished yet
  private collectUnfinishedDLMs() {
    // TODO: implement
    const q = {
      filters: {},
      types: this.system
        .getObjectTypes()
        .filter((t) => t.classification && t.classification.includes(this.DLM_CLASSIFIER))
        .map((t) => t.id)
    };
    // q.filters[BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS] = {
    //   o: SearchFilter.OPERATOR.EQUAL
    // };

    // TODO: search in system:tags when searching in tables is available
    // q.filters[`${BaseObjectTypeField.TAGS}.name`] = {
    //   o: SearchFilter.OPERATOR.EQUAL,
    //   v1: this.DLM_TAG
    // }
    // q.filters[`${BaseObjectTypeField.TAGS}.state`] = {
    //   o: SearchFilter.OPERATOR.EQUAL,
    //   v1: this.DLM_TAG
    // }
    this.searchService.search(new SearchQuery(q)).subscribe((res: SearchResult) => (this.unfinishedDLM = res.items));
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
    this.objCreateServcice.setNewState({ currentStep: step });
    if (step === CurrentStep.INDEXDATA && this.formState) {
      this.selectedObjectTypeFormOptions.data = this.formState.data;
    }
    if (step === CurrentStep.OBJECTTYPE) {
      this.dlmCreate = null;
    }
  }

  /**
   * Select an object type for the object to be created.
   * @param objectType The object type to be selected
   */
  selectObjectType(objectType: ObjectType) {
    this.formState = null;
    this.selectedObjectType = objectType;
    this.title = objectType ? this.system.getLocalizedResource(`${objectType.id}_label`) : this.labels.defaultTitle;
    this.objCreateServcice.setNewState({ busy: true });

    if (this.isDLMType(objectType)) {
      // DLM object types are treated in a different way
      this.processDLMType(objectType);
    } else {
      this.system.getObjectTypeForm(objectType.id, 'CREATE').subscribe(
        (model) => {
          this.objCreateServcice.setNewState({ busy: false });
          this.selectedObjectTypeFormOptions = {
            formModel: model,
            data: {}
          };
          // does selected type support contents?
          if (objectType.isFolder || objectType.contentStreamAllowed === 'notallowed') {
            this.objCreateServcice.setNewState({ currentStep: CurrentStep.INDEXDATA });
            this.objCreateServcice.setNewBreadcrumb(CurrentStep.INDEXDATA, CurrentStep.FILES);
          } else {
            this.objCreateServcice.setNewState({ currentStep: CurrentStep.FILES });
            this.objCreateServcice.setNewBreadcrumb(CurrentStep.FILES, CurrentStep.INDEXDATA);
          }
          this.objCreateServcice.setNewState({ done: this.isReady() });
        },
        (err) => {
          this.objCreateServcice.setNewState({
            busy: false,
            done: this.isReady()
          });
          this.notify.error(this.title, this.translate.instant('yuv.framework.object-create.step.objecttype.form.fail'));
        }
      );
    }
  }

  private isDLMType(objectType: ObjectType): boolean {
    return Array.isArray(objectType.classification) && objectType.classification.includes(this.DLM_CLASSIFIER);
  }

  private processDLMType(objectType: ObjectType) {
    if (objectType.isFolder || objectType.contentStreamAllowed === 'notallowed') {
      this.objCreateServcice.setNewState({ currentStep: CurrentStep.DLM_UPLOAD });
      this.objCreateServcice.setNewBreadcrumb(CurrentStep.DLM_UPLOAD, CurrentStep.FILES);
    } else {
      this.objCreateServcice.setNewState({ currentStep: CurrentStep.FILES });
      this.objCreateServcice.setNewBreadcrumb(CurrentStep.FILES, CurrentStep.DLM_UPLOAD);
    }
    this.objCreateServcice.setNewState({ busy: false, done: this.isReady() });
  }

  dlmUploadApprove() {
    let data = {};
    if (this.context) {
      data[BaseObjectTypeField.PARENT_ID] = this.context.id;
    }
    data[BaseObjectTypeField.TAGS] = [[this.DLM_TAG, 0]];
    this.busy = true;

    this.createObject(this.selectedObjectType.id, data, this.files)
      .pipe(
        takeUntilDestroy(this),
        switchMap((res: string[]) => this.dmsService.getDmsObjects(res))
      )
      .subscribe(
        (res: DmsObject[]) => {
          this.busy = false;
          this.objCreateServcice.setNewState({ currentStep: CurrentStep.DLM_INDEXDATA });
          this.dlmCreate = {
            dmsObject: { items: res },
            floatingSOT: { items: this.system.getFloatingSecondaryObjectTypes(this.selectedObjectType.id, true) }
          };
        },
        (err) => {
          this.busy = false;
          this.notify.error(this.translate.instant('yuv.framework.object-create.notify.error'));
        }
      );
  }

  dlmUploadCancel() {
    this.resetState();
  }

  clickedUnfinishedDLM(dlm: SearchResultItem) {
    const alreadySelected = this.dlmCreate?.dmsObject.selected.id === dlm.fields.get(BaseObjectTypeField.OBJECT_ID);
    if (alreadySelected) {
      this.resetState();
    } else {
      this.objCreateServcice.setNewState({ busy: true });
      this.dlmCreate = null;
      this.dmsService.getDmsObject(dlm.fields.get(BaseObjectTypeField.OBJECT_ID)).subscribe((dmsObject) => {
        this.selectedObjectType = this.system.getObjectType(dlm.objectTypeId, true);

        this.objCreateServcice.setNewState({ currentStep: CurrentStep.DLM_INDEXDATA, busy: false });
        this.dlmCreate = {
          dmsObject: {
            items: [dmsObject],
            selected: dmsObject
          },
          floatingSOT: { items: this.system.getFloatingSecondaryObjectTypes(this.selectedObjectType.id, true) }
        };
      });
    }
  }

  fileChosen(files: File[]) {
    this.files = [...this.files, ...files];
    this.objCreateServcice.setNewState({ done: this.isReady() });
  }

  filesClear() {
    this.files = [];
    this.objCreateServcice.setNewState({ done: this.isReady() });
  }

  removeFile(file: File, fileIndex: number) {
    this.files.splice(fileIndex, 1);
    this.objCreateServcice.setNewState({ done: this.isReady() });
  }

  onFilesDroppedOnType(files: File[], type?: ObjectType) {
    if (type) {
      this.selectObjectType(type);
    }
    this.files = [...this.files, ...files];
    this.objCreateServcice.setNewState({ done: this.isReady() });
  }

  fileSelectContinue() {
    const nextStep = this.isDLMType(this.selectedObjectType) ? CurrentStep.DLM_UPLOAD : CurrentStep.INDEXDATA;
    this.goToStep(nextStep);
    this.objCreateServcice.setNewBreadcrumb(nextStep);
  }

  private createObject(id: string, data: any, files: File[], silent = false): Observable<string[]> {
    return this.dmsService.createDmsObject(id, data, files, files.map((file) => file.name).join(', '), silent);
  }

  create() {
    let data = this.formState.data;
    if (this.context) {
      data[BaseObjectTypeField.PARENT_ID] = this.context.id;
    }
    this.busy = true;

    this.createObject(this.selectedObjectType.id, data, this.files)
      .pipe(takeUntilDestroy(this))
      .subscribe(
        (res) => {
          this.busy = false;
          // this.notify.success(this.translate.instant('yuv.framework.object-create.notify.success'));
          if (this.createAnother) {
            this.selectedObjectType = null;
            this.files = [];
            this.resetState();
            this.reset();
          } else {
            this.objectCreated.emit(res);
          }
        },
        (err) => {
          this.busy = false;
          this.notify.error(this.translate.instant('yuv.framework.object-create.notify.error'));
        }
      );
  }

  resetState() {
    this.dlmCreate = null;
    this.objCreateServcice.resetState();
    this.objCreateServcice.resetBreadcrumb();
  }

  reset() {
    this.formState = null;
    this.objectForm.resetForm();
  }

  onFormStatusChanged(evt) {
    this.formState = evt;
    this.objCreateServcice.setNewState({ done: this.isReady() });
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
          fileSelected = this.files.length > 0;
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
