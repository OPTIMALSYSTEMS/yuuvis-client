import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InboxService, ProcessVariable, Task, TaskflowVars, TranslateService } from '@yuuvis/core';
import { NotificationService } from '../../../../services/notification/notification.service';

@Component({
  selector: 'yuv-taskflow',
  templateUrl: './taskflow.component.html',
  styleUrls: ['./taskflow.component.scss']
})
export class TaskflowComponent implements OnInit {
  _task: Task;
  title: string;
  comment: string;
  commentHTML: string;
  initiator: string;
  status: string;

  forwardForm: FormGroup;

  showForwardPanel: boolean;
  busy: boolean;

  @Input() set task(t: Task) {
    this._task = t;
    this.extractTaskflowParams();
  }
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private notificationService: NotificationService,
    private inboxService: InboxService
  ) {
    this.forwardForm = this.fb.group({
      assignee: ['', Validators.required],
      comment: ['']
    });
  }

  private extractTaskflowParams() {
    const qa = {};
    this._task.variables.forEach((v) => (qa[v.name] = v));

    this.title = qa[TaskflowVars.title].value;
    this.initiator = this._task.initiator.title;
    this.status = qa[TaskflowVars.taskStatus].value;
    this.comment = qa[TaskflowVars.comment].value;
    if (this.comment) this.commentHTML = this.comment.replace(/\n\n/g, '<br><br>');
  }

  includeFormerComment() {
    this.forwardForm.patchValue({
      comment: `${this.initiator}: ${this.comment}\n\n`
    });
  }

  forward() {
    if (!this.showForwardPanel) {
      this.showForwardPanel = true;
    } else {
      console.log(this.forwardForm.value.assignee);
      console.log(this.forwardForm.value.comment);

      const processVars: ProcessVariable[] = [
        {
          name: TaskflowVars.nextAssignee,
          value: this.forwardForm.value.assignee
        },
        {
          name: TaskflowVars.comment,
          value: this.forwardForm.value.comment
        }
      ];

      this.busy = true;
      this.inboxService.updateTask(this._task.id, { variables: processVars }).subscribe(
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

  ngOnInit(): void {}
}
