import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import {
  BaseObjectTypeField,
  ContentStreamAllowed,
  DmsObject,
  DmsService,
  ObjectType,
  ObjectTypeGroup,
  SystemService,
  SystemType,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { FadeInAnimations } from '../../common/animations/fadein.animation';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { SelectableGroup } from '../../grouped-select';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../object-form/object-form.interface';
import { ObjectFormComponent } from '../../object-form/object-form/object-form.component';
import { NotificationService } from '../../services/notification/notification.service';
import { clear } from '../../svg.generated';
import { ObjectCreateService } from '../object-create.service';
import { Breadcrumb, CreateState, CurrentStep, Labels } from './../object-create.interface';

/**
 * This component is basically a wizard for creating new dms objects.
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

  context: DmsObject;

  animationTimer = { value: true, params: { time: '400ms' } };
  // state of creation progress
  state$: Observable<CreateState> = this.objCreateServcice.state$;
  breadcrumb$: Observable<Breadcrumb[]> = this.objCreateServcice.breadcrumb$;

  busy: boolean = false;
  createAnother: boolean = false;
  selectedObjectType: ObjectType;
  selectedObjectTypeFormOptions: ObjectFormOptions;

  // groups of object types available for the root target
  generalObjectTypeGroups: SelectableGroup[];
  // groups of object types available for a context
  contextObjectTypeGroups: SelectableGroup[];

  availableObjectTypeGroups: SelectableGroup[];
  formState: FormStatusChangedEvent;
  _files: File[] = [];
  labels: Labels;
  title: string;

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
    this._files = files || [];
    // TODO: Update availableObjectTypes to disable all types that do not support files

    if (files?.length) {
      this.availableObjectTypeGroups.forEach((g) => {
        g.items.forEach((i) => {
          i.disabled = i.value.contentStreamAllowed === ContentStreamAllowed.NOT_ALLOWED;
        });
      });
    }
  }

  get files(): File[] {
    return this._files;
  }

  /**
   * Triggered when the context set by the input property 'contextId' has been
   * removed by the user.
   */
  @Output() contextRemoved = new EventEmitter();

  /**
   * Emits the IDs of the objects that have been created
   */
  @Output() objectCreated = new EventEmitter<string[]>();

  constructor(
    private objCreateServcice: ObjectCreateService,
    private system: SystemService,
    private notify: NotificationService,
    private dmsService: DmsService,
    private translate: TranslateService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([clear]);
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
    this.availableObjectTypeGroups = this.generalObjectTypeGroups;
  }

  removeContext() {
    this.contextId = null;
    this.availableObjectTypeGroups = this.generalObjectTypeGroups;
    this.contextRemoved.emit();
  }

  removeFiles() {
    this.files = [];
  }

  goToStep(step: CurrentStep) {
    this.objCreateServcice.setNewState({ currentStep: step });
    if (step === CurrentStep.INDEXDATA && this.formState) {
      this.selectedObjectTypeFormOptions.data = this.formState.data;
    }
  }

  /**
   * Select an object type for the object to be created.
   * @param objectType The object type to be selected
   */
  selectObjectType(objectType: ObjectType) {
    this.selectedObjectType = objectType;
    this.title = objectType ? this.system.getLocalizedResource(`${objectType.id}_label`) : this.labels.defaultTitle;
    this.objCreateServcice.setNewState({ busy: true });

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
        this.objCreateServcice.setNewState({ done: false });
      }
    );
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
    this.goToStep(CurrentStep.INDEXDATA);
    this.objCreateServcice.setNewBreadcrumb(CurrentStep.INDEXDATA);
  }

  private createObject(id: string, data: any, files: File[]): Observable<string[]> {
    return this.dmsService.createDmsObject(id, data, files, files.map((file) => file.name).join(', '));
  }

  create() {
    let data = this.formState.data;
    if (this.context) {
      data[BaseObjectTypeField.PARENT_ID] = this.context.id;
    }
    this.createObject(this.selectedObjectType.id, data, this.files)
      .pipe(takeUntilDestroy(this), catchError(Utils.catch(null, this.translate.instant('yuv.framework.object-create.notify.error'))))
      .subscribe((res) => {
        this.notify.success(this.translate.instant('yuv.framework.object-create.notify.success'));
        if (this.createAnother) {
          this.selectedObjectType = null;
          this.files = [];
          this.resetState();
          this.reset();
        } else {
          this.objectCreated.emit(res);
        }
      });
  }

  resetState() {
    this.objCreateServcice.resetState();
    this.objCreateServcice.resetBreadcrumb();
  }

  reset() {
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
    this.availableObjectTypeGroups = this.contextObjectTypeGroups;
  }

  /**
   * Checks whether or not all requirements are met to create a new object.
   */
  private isReady() {
    const typeSelected = !!this.selectedObjectType;
    let fileSelected = false;
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
    return typeSelected && fileSelected && !!this.formState && !this.formState.invalid;
  }

  ngOnDestroy() {}
}
