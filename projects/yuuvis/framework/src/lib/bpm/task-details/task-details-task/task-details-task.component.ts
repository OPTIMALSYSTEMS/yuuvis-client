import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  InboxService,
  PendingChangesService,
  ProcessPostPayload,
  ProcessVariable,
  SystemService,
  Task,
  TaskMessage,
  TaskType,
  TranslateService
} from '@yuuvis/core';
import { FormStatusChangedEvent, ObjectFormOptions } from '../../../object-form/object-form.interface';
import { ObjectFormComponent } from '../../../object-form/object-form/object-form.component';
import { PopoverService } from '../../../popover/popover.service';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'yuv-task-details-task',
  templateUrl: './task-details-task.component.html',
  styleUrls: ['./task-details-task.component.scss']
})
export class TaskDetailsTaskComponent implements OnInit {
  @ViewChild(ObjectFormComponent) taskForm: ObjectFormComponent;
  @ViewChild('tplDelegationAssignee') tplDelegationAssignee: TemplateRef<any>;

  private pendingTaskId: string;
  busy: boolean;
  _task: Task;
  taskDescription: string;
  taskMessages: TaskMessage[] = [];
  taskMessagesList: TaskMessage[] = [];
  formState: FormStatusChangedEvent;

  @Input() set task(t: Task) {
    this._task = t;
    this.error = null;
    this.formOptions = null;
    this.formState = null;
    this.claimable = false;
    this.taskDescription = this.getDescription(t);
    this.getMessages(t);

    if (t?.taskForm) {
      if (t.taskForm.model) {
        this.formOptions = {
          formModel: t.taskForm.model,
          data: this.getFormDataFromProcessVars(t)
        };
      } else if (t.taskForm.schemaProperties) {
        this.formOptions = {
          formModel: this.getFormModelFromSchemaProperties(t.taskForm.schemaProperties),
          data: this.getFormDataFromProcessVars(t)
        };
      }
    } else if (t && t.formKey) {
      this.createReferencedForm(t, !t.assignee);
    } // check for claiming ability
    // If there is no assignee yet you have to claim the task. If there is an assignee
    // but no claimTime it means that claining is no option whatsoever
    this.claimable = !t.assignee || !!t.claimTime;
    this.delegatable = t && !t.delegationState;
    if (t?.delegationState === 'pending') this.claimable = false;
  }

  formOptions: ObjectFormOptions;
  // whether or not claiming is an option
  claimable: boolean;
  delegatable: boolean;
  error: any;

  @Output() taskUpdated = new EventEmitter<Task>();

  constructor(
    private inboxService: InboxService,
    private popoverService: PopoverService,
    private pendingChanges: PendingChangesService,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private system: SystemService
  ) {}

  getFormModelFromSchemaProperties(schemaProperties: string[]): any {
    const elements = [];
    schemaProperties.forEach((p) => {
      const otp = this.system.system.allFields[p];
      if (otp) {
        elements.push(this.system.toFormElement(otp));
      }
    });
    return {
      elements: [
        {
          name: 'core',
          type: 'o2mGroup',
          elements
        }
      ]
    };
  }

  private getMessages(t: Task) {
    this.taskMessages = [];
    this.taskMessagesList = [];
    if (t?.taskMessages?.length) {
      t.taskMessages.forEach((m) => {
        const msg = {
          level: m.level,
          message: this.system.getLocalizedResource(m.message) || m.message
        };
        if (m.type === 'ul') {
          this.taskMessagesList.push(msg);
        } else {
          this.taskMessages.push(msg);
        }
      });
    }
  }

  private getDescription(t: Task): string {
    let label = this.system.getLocalizedResource(`${t.name}_description`);
    if (!label && t.processDefinition.idPrefix === TaskType.FOLLOW_UP) {
      label = this.translate.instant(`yuv.framework.process.type.follow-up.defaultTaskDescription`);
    }
    return t ? label : null;
  }

  private getFormDataFromProcessVars(t: Task) {
    const formData: any = {};
    if (t.variables) {
      t.variables.forEach((v) => {
        formData[v.name] = v.value;
      });
    }
    return formData;
  }

  private createReferencedForm(t: Task, disabled: boolean = false) {
    if (t.formKey) {
      this.inboxService.getTaskForm(t.formKey).subscribe(
        (res) => {
          if (res) {
            const formData = this.getFormDataFromProcessVars(t);
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
    this.busy = true;
    this.inboxService.updateTask(this._task.id, this.getUpdatePayload()).subscribe(
      (res) => {
        this.busy = false;
        this.finishPending();
        this.formState = null;
      },
      (err) => {
        this.busy = false;
        console.error(err);
        this.notificationService.error(this.translate.instant('yuv.framework.task-details-task.update.fail'));
      }
    );
  }

  confirm() {
    this.busy = true;
    this.inboxService.completeTask(this._task.id, this.getUpdatePayload()).subscribe(
      (res) => {
        this.busy = false;
        this.finishPending();
        this.formState = null;
      },
      (err) => {
        this.busy = false;
        console.error(err);
        this.notificationService.error(this.translate.instant('yuv.framework.task-details-task.update.fail'));
      }
    );
  }

  resolve() {
    this.busy = true;
    this.inboxService.resolveTask(this._task.id, this.getUpdatePayload()).subscribe(
      (res) => {
        this.busy = false;
        this.finishPending();
        this.taskUpdated.emit(res);
        this.formState = null;
      },
      (err) => {
        this.busy = false;
        console.error(err);
        this.notificationService.error(this.translate.instant('yuv.framework.task-details-task.update.fail'));
      }
    );
  }

  claim(claim: boolean) {
    this.busy = true;
    this.inboxService.claimTask(this._task.id, claim).subscribe(
      (res) => {
        this.busy = false;
        this.taskUpdated.emit(res);
      },
      (err) => {
        this.busy = false;
        console.error(err);
        this.notificationService.error(this.translate.instant('yuv.framework.task-details-task.update.fail'));
      }
    );
  }

  delegate(userId: string) {
    this.busy = true;
    this.inboxService.delegateTask(this._task.id, userId).subscribe(
      (res) => {
        this.busy = false;
        this.taskUpdated.emit(res);
      },
      (err) => {
        this.busy = false;
        console.error(err);
        this.notificationService.error(this.translate.instant('yuv.framework.task-details-task.update.fail'));
      }
    );
  }

  getDelegationAssignee() {
    this.popoverService.open(this.tplDelegationAssignee, {
      minWidth: 200,
      maxWidth: 400
    });
  }

  private startPending() {
    if (!this.pendingChanges.hasPendingTask(this.pendingTaskId || ' ')) {
      this.pendingTaskId = this.pendingChanges.startTask(this.translate.instant('yuv.framework.object-form-edit.pending-changes.alert'));
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

    // form elements width mutiple values will always be submitted as JSON
    // because Flowable does not support arrays right now
    if (formElement.cardinality === 'multi') {
      pv.type = 'json';
    }
    return pv;
  }

  ngOnInit(): void {}
}
