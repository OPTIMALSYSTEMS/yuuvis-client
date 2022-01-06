import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InboxService, ProcessVariable, Task, TaskflowVars, TranslateService } from '@yuuvis/core';
import { IconRegistryService } from '../../../../common/components/icon/service/iconRegistry.service';
import { NotificationService } from '../../../../services/notification/notification.service';
import { deleteIcon, edit } from '../../../../svg.generated';

@Component({
  selector: 'yuv-taskflow',
  templateUrl: './taskflow.component.html',
  styleUrls: ['./taskflow.component.scss']
})
export class TaskflowComponent implements OnInit {
  _task: Task;
  title: string;
  comment: string;
  note: string;
  commentHTML: string;
  initiator: string;
  status: string;

  forwardForm: FormGroup;
  noteForm: FormGroup;

  showForwardPanel: boolean;
  editMode: boolean;
  busy: boolean;

  @Input() set task(t: Task) {
    this._task = t;
    this.forwardForm.reset();
    this.noteForm.reset();
    this.commentHTML = undefined;
    this.extractTaskflowParams();
  }
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private inboxService: InboxService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([edit, deleteIcon]);
    this.forwardForm = this.fb.group({
      nextAssignee: ['', Validators.required],
      expiryDateTime: [''],
      comment: ['']
    });

    this.noteForm = this.fb.group({
      note: ['']
    });
  }

  private extractTaskflowParams() {
    const qa = {};
    this._task.variables.forEach((v) => (qa[v.name] = v));

    this.title = qa[TaskflowVars.title].value;
    this.initiator = this._task.initiator.title;
    this.status = qa[TaskflowVars.taskStatus] ? qa[TaskflowVars.taskStatus].value : 'Open';
    this.comment = qa[TaskflowVars.comment].value;

    this.note = qa[TaskflowVars.note] ? qa[TaskflowVars.note].value : undefined;
    if (this.note) this.noteForm.patchValue({ note: this.note });
    if (qa[TaskflowVars.expiryDateTime]) this.forwardForm.patchValue({ expiryDateTime: qa[TaskflowVars.expiryDateTime].value });
    if (this.comment) this.commentHTML = this.comment.replace(/\n\n/g, '<br><br>');
  }

  includeFormerComment() {
    this.forwardForm.patchValue({
      comment: `${this.initiator}: ${this.comment}\n\n`
    });
  }

  saveNote() {
    this.note = this.noteForm.value.note;
    this.inboxService
      .updateTask(this._task.id, {
        variables: [
          {
            name: TaskflowVars.note,
            type: 'string',
            value: this.note
          }
        ]
      })
      .subscribe((_) => this.noteForm.markAsPristine());
  }

  forward() {
    if (!this.showForwardPanel) {
      this.showForwardPanel = true;
    } else {
      const processVars: ProcessVariable[] = [
        {
          name: TaskflowVars.nextAssignee,
          type: 'string',
          value: this.forwardForm.value.nextAssignee
        },
        {
          name: TaskflowVars.comment,
          type: 'string',
          value: this.forwardForm.value.comment
        },
        {
          name: TaskflowVars.note,
          type: 'string',
          value: ''
        }
      ];

      this.busy = true;
      this.inboxService.updateTask(this._task.id, { variables: processVars }).subscribe(
        (res) => {
          this.busy = false;
          this.forwardForm.reset();
          this.showForwardPanel = false;
        },
        (err) => {
          this.busy = false;
          console.error(err);
          this.notificationService.error(this.translate.instant('yuv.framework.task-details-task.update.fail'));
        }
      );
    }
  }

  confirm() {
    const processVars: ProcessVariable[] = [
      {
        name: TaskflowVars.taskStatus,
        value: 'Done'
      }
    ];

    this.busy = true;
    this.inboxService.completeTask(this._task.id, { variables: processVars }).subscribe(
      (res) => {
        this.busy = false;
      },
      (err) => {
        this.busy = false;
        console.error(err);
        this.notificationService.error(this.translate.instant('yuv.framework.task-details-task.update.fail'));
      }
    );
  }

  removeNote() {
    this.inboxService
      .updateTask(this._task.id, {
        variables: [
          {
            name: TaskflowVars.note,
            value: ''
          }
        ]
      })
      .subscribe((res) => {
        this.noteForm.reset();
      });
  }

  ngOnInit(): void {}
}
