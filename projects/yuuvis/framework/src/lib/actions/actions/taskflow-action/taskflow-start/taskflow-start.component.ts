import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendService, BpmEvent, EventService, ProcessCreatePayload, ProcessDefinitionKey, TaskflowVars, TranslateService } from '@yuuvis/core';
import { NotificationService } from '../../../../services/notification/notification.service';
import { ActionComponent } from '../../../interfaces/action-component.interface';

@Component({
  selector: 'yuv-taskflow-start',
  templateUrl: './taskflow-start.component.html',
  styleUrls: ['./taskflow-start.component.scss']
})
export class TaskflowStartComponent implements OnInit, ActionComponent {
  taskflowStartForm: FormGroup;
  busy: boolean;

  @Input() selection: any[];
  @Output() finished: EventEmitter<any> = new EventEmitter<any>();
  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private eventService: EventService,
    private backend: BackendService
  ) {
    this.taskflowStartForm = this.fb.group({
      expiryDateTime: [''],
      title: ['', Validators.required],
      nextAssignee: ['', Validators.required],
      comment: ['']
    });
  }

  startTaskflow() {
    this.busy = true;
    const dmsObject = this.selection[0];
    const vars = [
      { name: TaskflowVars.title, type: 'string', value: this.taskflowStartForm.value.title },
      { name: TaskflowVars.comment, type: 'string', value: this.taskflowStartForm.value.comment },
      { name: TaskflowVars.nextAssignee, type: 'string', value: this.taskflowStartForm.value.nextAssignee }
    ];

    if (this.taskflowStartForm.value.expiryDateTime) {
      vars.push({ name: TaskflowVars.expiryDateTime, type: 'date', value: this.taskflowStartForm.value.expiryDateTime });
    }

    const payload: ProcessCreatePayload = {
      processDefinitionKey: ProcessDefinitionKey.TASK_FLOW,
      businessKey: dmsObject.id,
      name: dmsObject.title || dmsObject.id,
      subject: dmsObject.title,
      variables: vars
    };

    this.backend.post('/bpm/processes', payload).subscribe(
      (_) => {
        this.busy = false;
        this.notificationService.success(
          this.translate.instant('yuv.framework.action-menu.action.taskflow.label'),
          this.translate.instant('yuv.framework.action-menu.action.taskflow.done.message')
        );
        this.finished.emit();
        this.eventService.trigger(BpmEvent.BPM_EVENT);
      },
      (err) => {
        this.busy = false;
      }
    );
  }

  cancel() {
    this.canceled.emit();
  }

  ngOnInit(): void {}
}
