import { Component, ViewChild } from '@angular/core';
import { ObjectType, PendingChangesService, SystemService, TranslateService, Utils } from '@yuuvis/core';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../object-form/object-form.interface';
import { ObjectFormComponent } from '../../object-form/object-form/object-form.component';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-object-create',
  templateUrl: './object-create.component.html',
  styleUrls: ['./object-create.component.scss']
})
export class ObjectCreateComponent {
  @ViewChild(ObjectFormComponent, { static: false }) objectForm: ObjectFormComponent;

  icon = {
    clear: SVGIcons['clear']
  };

  // state of creation progress
  state: {
    currentStep: 'objecttype' | 'files' | 'indexdata';
    busy: boolean;
    done: boolean;
  };
  createAnother: boolean;
  // selectedIndex: number = 0;
  availableDocumentTypes: { type: ObjectType; label: string }[] = [];
  availableFolderTypes: { type: ObjectType; label: string }[] = [];

  selectedObjectType: ObjectType;
  selectedObjectTypeFormOptions: ObjectFormOptions;
  formState: FormStatusChangedEvent;
  files: File[] = [];
  breadcrumb;
  labels;
  title;

  private pendingTaskId: string;

  constructor(private system: SystemService, private translate: TranslateService, private pendingChanges: PendingChangesService) {
    this.resetState();

    this.system
      .getObjectTypes()
      .filter(ot => ot.creatable)
      .map(ot => ({
        type: ot,
        label: this.system.getLocalizedResource(`${ot.id}_label`)
      }))
      .sort(Utils.sortValues('label'))
      .forEach(ot => {
        if (ot.type.isFolder) {
          this.availableFolderTypes.push(ot);
        } else {
          this.availableDocumentTypes.push(ot);
        }
      });

    this.labels = {
      defaultTitle: this.translate.instant('yuv.framework.object-create.header.title'),
      allowed: this.translate.instant('yuv.framework.object-create.step.type.content.allowed'),
      notallowed: this.translate.instant('yuv.framework.object-create.step.type.content.notallowed'),
      required: this.translate.instant('yuv.framework.object-create.step.type.content.required')
    };
    this.title = this.labels.defaultTitle;
    this.initBreadcrumb();
  }

  goToStep(step: 'objecttype' | 'files' | 'indexdata') {
    this.state.currentStep = step;
    if (step === 'indexdata' && this.formState) {
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
    this.files = [];
    this.state.busy = true;
    this.startPending();

    this.system.getObjectTypeForm(objectType.id, 'CREATE').subscribe(
      model => {
        this.state.busy = false;
        this.selectedObjectTypeFormOptions = {
          formModel: model,
          data: {}
        };
        // does selected type support contents?
        if (objectType.isFolder || objectType.contentStreamAllowed === 'notallowed') {
          this.state.currentStep = 'indexdata';
          this.breadcrumb[1].visible = false;
          this.breadcrumb[2].visible = true;
        } else {
          this.state.currentStep = 'files';
          this.breadcrumb[2].visible = false;
          this.breadcrumb[1].visible = true;
        }
        this.state.done = this.isReady();
      },
      err => {
        this.state.busy = false;
      }
    );
  }

  fileChosen(files: File[]) {
    this.files = [...this.files, ...files];
    this.state.done = this.isReady();
  }

  filesClear() {
    this.files = [];
    this.state.done = this.isReady();
  }

  removeFile(file: File) {
    this.files = this.files.filter(f => f.name !== file.name);
    this.state.done = this.isReady();
  }

  onFilesDroppedOnType(files: File[], type?: ObjectType) {
    if (type) {
      this.selectObjectType(type);
    }
    this.files = [...this.files, ...files];
    this.state.done = this.isReady();
  }

  fileSelectContinue() {
    this.goToStep('indexdata');
    this.breadcrumb[2].visible = true;
  }

  create() {
    // TODO: actually create the object

    this.finishPending();
    if (this.createAnother) {
      this.selectedObjectType = null;
      this.files = [];
      this.resetState();
    }
  }

  resetState() {
    this.state = {
      currentStep: 'objecttype',
      busy: false,
      done: false
    };
    this.initBreadcrumb();
  }

  reset() {
    this.objectForm.resetForm();
  }

  onFormStatusChanged(evt) {
    this.formState = evt;
    this.state.done = this.isReady();
  }

  private initBreadcrumb() {
    this.breadcrumb = [
      {
        step: 'objecttype',
        label: this.translate.instant('yuv.framework.object-create.step.type'),
        visible: true
      },
      {
        step: 'files',
        label: this.translate.instant('yuv.framework.object-create.step.file'),
        visible: false
      },
      {
        step: 'indexdata',
        label: this.translate.instant('yuv.framework.object-create.step.indexdata'),
        visible: false
      }
    ];
  }

  /**
   * Checks whether or not all requirements are met to create a
   * new object.
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
}
