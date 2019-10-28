import { Component, ViewChild } from '@angular/core';
import { ObjectType, PendingChangesService, SystemService } from '@yuuvis/core';
import { StepperPanelComponent } from '../../components/stepper-panel/stepper-panel.component';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../object-form/object-form.interface';
import { ObjectFormComponent } from '../../object-form/object-form/object-form.component';

@Component({
  selector: 'yuv-object-create',
  templateUrl: './object-create.component.html',
  styleUrls: ['./object-create.component.scss']
})
export class ObjectCreateComponent {
  @ViewChild('stepper', { static: true }) stepper: StepperPanelComponent;
  @ViewChild(ObjectFormComponent, { static: false }) objectForm: ObjectFormComponent;

  // state of creation progress
  completed = {
    file: false,
    indexdata: false
  };
  busy: boolean;
  done: boolean;
  createAnother: boolean;

  selectedIndex: number = 0;
  availableTypes: { type: ObjectType; label: string }[];

  selectedObjectType: ObjectType;
  selectedObjectTypeFormOptions: ObjectFormOptions;
  formState: FormStatusChangedEvent;

  private pendingTaskId: string;

  constructor(private system: SystemService, private pendingChanges: PendingChangesService) {
    this.availableTypes = this.system
      .getObjectTypes()
      .filter(ot => ot.creatable)
      .map(ot => ({
        type: ot,
        label: this.system.getLocalizedResource(`${ot.id}_label`)
      }));
  }

  selectObjectType(objectType: ObjectType) {
    this.selectedObjectType = objectType;
    this.busy = true;
    this.startPending();

    this.system.getObjectTypeForm(objectType.id, 'CREATE').subscribe(
      model => {
        this.busy = false;
        this.selectedObjectTypeFormOptions = {
          formModel: model,
          data: {}
        };

        // does selected type support contents?
        if (!objectType.contentStreamAllowed) {
          this.completed.file = true;
          this.stepper.selectedIndex = 2;
        } else {
          this.stepper.selectedIndex = 1;
        }
      },
      err => {
        this.busy = false;
      }
    );
  }

  create() {
    // TODO: actually create the object

    this.finishPending();
    if (this.createAnother) {
      this.stepper.selectedIndex = 0;
    }
  }

  reset() {
    this.objectForm.resetForm();
  }

  onFormStatusChanged(evt) {
    this.formState = evt;
    this.done = !this.formState.invalid;
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
