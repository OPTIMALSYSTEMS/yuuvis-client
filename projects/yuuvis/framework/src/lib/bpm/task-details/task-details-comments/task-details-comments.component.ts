import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BpmService, ProcessInstanceComment, Task } from '@yuuvis/core';

@Component({
  selector: 'yuv-task-details-comments',
  templateUrl: './task-details-comments.component.html',
  styleUrls: ['./task-details-comments.component.scss']
})
export class TaskDetailsCommentsComponent implements OnInit {
  comments: ProcessInstanceComment[] = [];
  busy: boolean;
  error: string;

  commentForm: FormGroup = this.fb.group({
    comment: ['', Validators.required]
  });

  private _task: Task;
  @Input() set task(task: Task) {
    this._task = task;
    if (task) {
      this.fetchComments(task.processInstanceId);
    } else {
      this.comments = [];
    }
  }

  constructor(private bpmService: BpmService, private fb: FormBuilder) {}

  addComment() {
    this.bpmService.addProcessComment(this._task.id, this.commentForm.value.comment).subscribe((_) => {
      this.commentForm.reset();
      this.fetchComments(this._task.processInstanceId);
    });
  }

  private fetchComments(processInstanceId: string) {
    this.error = null;
    this.busy = true;
    this.bpmService.getProcessComments(processInstanceId).subscribe(
      (res) => {
        this.comments = res;
        this.busy = false;
      },
      (err) => {
        console.error(err);
        this.error = err;
        this.busy = false;
      }
    );
  }

  trackByFn(index, item) {
    return item.id;
  }

  ngOnInit(): void {}
}
