import { Location } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FadeInAnimations } from '@yuuvis/common-ui';
import { DmsService, ObjectType, PendingChangesService, SystemService, TranslateService, Utils } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../object-form/object-form.interface';
import { ObjectFormComponent } from '../../object-form/object-form/object-form.component';
import { NotificationService } from '../../services/notification/notification.service';
import { SVGIcons } from '../../svg.generated';
import { ObjectCreateService } from '../object-create.service';
import { Breadcrumb, CreateState, CurrentStep, Labels } from './../object-create.interface';

@Component({
  selector: 'yuv-object-create',
  templateUrl: './object-create.component.html',
  styleUrls: ['./object-create.component.scss'],
  animations: [FadeInAnimations.fadeIn],
  providers: [ObjectCreateService]
})
export class ObjectCreateComponent implements OnDestroy {
  @ViewChild(ObjectFormComponent, { static: false }) objectForm: ObjectFormComponent;

  icon = {
    clear: SVGIcons['clear']
  };
  animationTimer = { value: true, params: { time: '400ms' } };
  // state of creation progress
  state$: Observable<CreateState> = this.objCreateServcice.state$;
  breadcrumb$: Observable<Breadcrumb[]> = this.objCreateServcice.breadcrumb$;

  createAnother: boolean = false;
  // selectedIndex: number = 0;
  availableDocumentTypes: { type: ObjectType; label: string }[] = [];
  availableFolderTypes: { type: ObjectType; label: string }[] = [];

  selectedObjectType: ObjectType;
  selectedObjectTypeFormOptions: ObjectFormOptions;
  formState: FormStatusChangedEvent;
  files: File[] = [];
  labels: Labels;
  title: string;

  constructor(
    private objCreateServcice: ObjectCreateService,
    private system: SystemService,
    private notify: NotificationService,
    private dmsService: DmsService,
    private translate: TranslateService,
    private pendingChanges: PendingChangesService,
    private router: Router,
    private location: Location
  ) {
    this.resetState();

    this.system
      .getObjectTypes()
      .filter(ot => ot.creatable)
      .map(ot => ({ type: ot, label: this.system.getLocalizedResource(`${ot.id}_label`) }))
      .sort(Utils.sortValues('label'))
      .forEach(ot => (ot.type.isFolder ? this.availableFolderTypes.push(ot) : this.availableDocumentTypes.push(ot)));

    this.labels = {
      defaultTitle: this.translate.instant('yuv.framework.object-create.header.title'),
      allowed: this.translate.instant('yuv.framework.object-create.step.type.content.allowed'),
      notallowed: this.translate.instant('yuv.framework.object-create.step.type.content.notallowed'),
      required: this.translate.instant('yuv.framework.object-create.step.type.content.required')
    };
    this.title = this.labels.defaultTitle;
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
    this.files = [];
    this.objCreateServcice.setNewState({ busy: true });

    this.system.getObjectTypeForm(objectType.id, 'CREATE').subscribe(
      model => {
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
      err => {
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

  private createObject(id: string, data: any, files: File[]): Observable<any> {
    return this.dmsService.createDmsObject(id, data, files, files.map(file => file.name).join(', '));
  }

  create() {
    this.createObject(this.selectedObjectType.id, this.formState.data, this.files)
      .pipe(takeUntilDestroy(this), catchError(Utils.catch(null, this.translate.instant('yuv.framework.object-create.notify.error'))))
      .subscribe(res => {
        this.notify.success(this.translate.instant('yuv.framework.object-create.notify.success'));
        if (this.createAnother) {
          this.selectedObjectType = null;
          this.files = [];
          this.resetState();
          this.reset();
        } else {
          if (res.length > 1) {
            this.location.back();
          } else {
            const id = Utils.getProperty(res, '0.properties.system:objectId.value');
            if (id) {
              // TODO: remove timeout when backend is synced
              setTimeout(() => this.router.navigate(['object', id]), 1000);
            }
          }
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