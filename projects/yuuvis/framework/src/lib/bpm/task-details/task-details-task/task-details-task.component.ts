import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { InboxService, PendingChangesService, ProcessPostPayload, ProcessVariable, SystemService, Task, TaskType, TranslateService } from '@yuuvis/core';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../../object-form/object-form.interface';
import { ObjectFormComponent } from '../../../object-form/object-form/object-form.component';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'yuv-task-details-task',
  templateUrl: './task-details-task.component.html',
  styleUrls: ['./task-details-task.component.scss']
})
export class TaskDetailsTaskComponent implements OnInit {
  @ViewChild(ObjectFormComponent) taskForm: ObjectFormComponent;

  private pendingTaskId: string;
  _task: Task;
  taskDescription: string;
  formState: FormStatusChangedEvent;

  @Input() set task(t: Task) {
    this._task = t;
    this.error = null;
    this.taskDescription = this.getDescription(t);
    if (t && t.formKey) {
      // check for claiming ability
      // If there is no assignee yet you have to claim the task. If there is an assignee
      // but no claimTime it means that claining is no option whatsoever
      this.claimable = !t.assignee || !!t.claimTime;
      this.createReferencedForm(t, !t.assignee);
    } else {
      this.formOptions = null;
    }
  }

  formOptions: ObjectFormOptions;
  // whether or not claiming is an option
  claimable: boolean;
  error: any;

  constructor(
    private inboxService: InboxService,
    private pendingChanges: PendingChangesService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private system: SystemService
  ) {}

  private getDescription(t: Task): string {
    let label = this.system.getLocalizedResource(`${t.name}_description`);
    if (!label && t.processDefinition.idPrefix === TaskType.FOLLOW_UP) {
      label = this.translate.instant(`yuv.framework.process.type.follow-up.defaultTaskDescription`);
    }
    return t ? label : null;
  }

  private createReferencedForm(t: Task, disabled: boolean = false) {
    if (t.formKey) {
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
              disabled: disabled,
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
      (err) => {
        console.error(err);
        this.notificationService.error(this.translate.instant('yuv.framework.task-details-task.update.fail'));
      }
    );
  }

  confirm() {
    this.inboxService.completeTask(this._task.id, this.getUpdatePayload()).subscribe(
      (res) => {
        this.finishPending();
        this.formState = null;
      },
      (err) => {
        console.error(err);
        this.notificationService.error(this.translate.instant('yuv.framework.task-details-task.update.fail'));
      }
    );
  }

  claim(claim: boolean) {
    this.inboxService.claimTask(this._task.id, claim).subscribe(
      (res) => {
        this.task = res;
      },
      (err) => {
        console.error(err);
        this.notificationService.error(this.translate.instant('yuv.framework.task-details-task.update.fail'));
      }
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
