import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InboxService, Task } from '@yuuvis/core';

@Component({
  selector: 'yuv-task-details-attachments',
  templateUrl: './task-details-attachments.component.html',
  styleUrls: ['./task-details-attachments.component.scss']
})
export class TaskDetailsAttachmentsComponent implements OnInit {
  disabled: boolean;
  _task: Task;
  @Input() set task(t: Task) {
    this._task = t;
    // editing of attachments should only be allowed if the task has an assignee
    this.disabled = !t.assignee;
  }

  @Input() layoutOptionsKey: string;

  @Output() attachmentRemoved = new EventEmitter<string>();
  @Output() attachmentAdded = new EventEmitter<string>();
  @Output() attachmentOpenExternal = new EventEmitter<string>();

  constructor(private inboxService: InboxService) {}

  onAttachmentAdd(id: string) {
    this._task.attachments = [...(this._task.attachments ? this._task.attachments : []), id];
    this.updateAttachments().subscribe((res) => {
      this.attachmentAdded.emit(id);
    });
  }

  onAttachmentRemove(id: string) {
    this._task.attachments = this._task.attachments.filter((a) => a !== id);
    this.updateAttachments().subscribe((res) => {
      this.attachmentRemoved.emit(id);
    });
  }

  onAttachmentOrderChange(orderedAttachments: string[]) {
    this._task.attachments = orderedAttachments;
    this.updateAttachments().subscribe((res) => {});
  }

  private updateAttachments() {
    return this.inboxService.updateTask(this._task.id, { attachments: this._task.attachments });
  }

  ngOnInit(): void {}
}
