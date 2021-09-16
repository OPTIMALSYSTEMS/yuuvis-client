import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InboxService, PendingChangesService, ProcessPostPayload, ProcessVariable, SystemService, Task, TaskType, TranslateService } from '@yuuvis/core';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../../object-form/object-form.interface';
import { ObjectFormComponent } from '../../../object-form/object-form/object-form.component';

@Component({
  selector: 'yuv-task-details-task',
  templateUrl: './task-details-task.component.html',
  styleUrls: ['./task-details-task.component.scss']
})
export class TaskDetailsTaskComponent implements OnInit {
  @ViewChild(ObjectFormComponent) taskForm: ObjectFormComponent;

  private pendingTaskId: string;
  private _task: Task;
  taskDescription: string;
  formState: FormStatusChangedEvent;

  @Input() set task(t: Task) {
    this._task = t;
    this.error = null;
    this.taskDescription = this.getDescription(t);
    if (t && t.formKey) {
      this.createReferencedForm(t);
    } else {
      this.formOptions = null;
    }
  }

  formOptions: ObjectFormOptions;
  error: any;

  constructor(
    private inboxService: InboxService,
    private pendingChanges: PendingChangesService,
    private translate: TranslateService,
    private system: SystemService
  ) {}

  private getDescription(t: Task): string {
    let label = this.system.getLocalizedResource(`${t.name}_description`);
    if (!label && t.processDefinition.idPrefix === TaskType.FOLLOW_UP) {
      label = this.translate.instant(`yuv.framework.process.type.follow-up.defaultTaskDescription`);
    }
    return t ? label || t.name : null;
  }

  private createReferencedForm(t: Task) {
    this.inboxService.getTaskForm(t.formKey).subscribe(
      (res) => {
        if (res) {
          const formData: any = {};
          if (t.variables) {
            t.variables.forEach((v) => {
              formData[v.name] = v.value;
            });
          }
          this.formOptions = {
            formModel: res,
            data: formData
          };
        }
      },
      (err) => {
        this.formOptions = null;
        console.error('Error loading referenced task form', err);
        this.error = err;
      }
    );
  }

  onFormStatusChanged(e: FormStatusChangedEvent) {
    this.formState = e;
    if (e.dirty) {
      this.startPending();
    }
  }

  resetForm() {
    this.taskForm.resetForm();
  }

  update() {
    this.inboxService.updateTask(this._task.id, this.getUpdatePayload()).subscribe(
      (res) => {
        this.finishPending();
        this.formState = null;
      },
      (err) => console.error(err)
    );
  }

  confirm() {
    this.inboxService.completeTask(this._task.id, this.getUpdatePayload()).subscribe(
      (res) => {
        this.finishPending();
        this.formState = null;
      },
      (err) => console.error(err)
    );
  }

  private startPending() {
    if (!this.pendingChanges.hasPendingTask(this.pendingTaskId || ' ')) {
      this.pendingTaskId = this.pendingChanges.startTask();
    }
  }

  private finishPending() {
    if (this.pendingTaskId) {
      this.pendingChanges.finishTask(this.pendingTaskId);
    }
  }

  private getUpdatePayload(): ProcessPostPayload {
    const vars = this.formState && !this.formState.invalid ? this.formToProcessVars() : null;
    return vars ? { variables: vars } : {};
  }

  // map form values to process variables
  private formToProcessVars(): ProcessVariable[] {
    const formElements = this.taskForm.getFormElements();
    return Object.keys(formElements).map((k) => this.mapFormElementToProcessVar(formElements[k]));
  }

  private mapFormElementToProcessVar(formElement: any): ProcessVariable {
    const pv: ProcessVariable = {
      name: formElement.name,
      scope: 'global',
      value: null
    };
    const formValue = this.formState.data[formElement.name];
    switch (formElement.type) {
      case 'datetime': {
        pv.type = 'date';
        pv.value = formValue;
        break;
      }
      case 'decimal': {
        pv.type = 'double';
        pv.value = formValue;
        break;
      }
      case 'table': {
        pv.type = 'json';
        pv.value = formValue;
        break;
      }
      default: {
        pv.type = formElement.type;
        pv.value = formValue;
      }
    }
    return pv;
  }

  ngOnInit(): void {}
}
