import { Component, ElementRef, Input, OnInit } from '@angular/core';
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

  constructor(private bpmService: BpmService, private fb: FormBuilder, private elRef: ElementRef) {}

  addComment() {
    this.bpmService.addProcessComment(this._task.id, this.commentForm.value.comment).subscribe((comment: ProcessInstanceComment) => {
      this.commentForm.reset();
      this.fetchComments(this._task.processInstanceId, comment.id);
    });
  }

  /**
   * Fetch comments for a particular process instance
   * @param processInstanceId ID of the process instance to fetch comments for
   * @param focusId ID of the comment to be focused (scrolled into view to ensure visibility)
   */
  private fetchComments(processInstanceId: string, focusId?: string) {
    this.error = null;
    this.busy = true;
    this.bpmService.getProcessComments(processInstanceId).subscribe(
      (res: ProcessInstanceComment[]) => {
        this.comments = res;
        this.busy = false;
        this.focusComment(focusId);
      },
      (err) => {
        console.error(err);
        this.error = err;
        this.busy = false;
      }
    );
  }

  private focusComment(id: string) {
    setTimeout(() => {
      this.elRef.nativeElement.querySelector(id ? `#c${id}` : `.comment:last-child`).scrollIntoView();
    }, 200);
  }

  trackByFn(index, item) {
    return item.id;
  }

  ngOnInit(): void {}
}
