import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BpmService, Process, ProcessInstanceComment, Task } from '@yuuvis/core';
import { EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'yuv-task-details-comments',
  templateUrl: './task-details-comments.component.html',
  styleUrls: ['./task-details-comments.component.scss']
})
export class TaskDetailsCommentsComponent implements OnInit {
  comments: ProcessInstanceComment[] = [];
  busy: boolean;
  errorMessage: string;
  inputHidden: boolean;

  commentForm: FormGroup = this.fb.group({ comment: ['', Validators.required] });

  @Input()
  set process(process: Process) {
    this.inputHidden = !!process;
    this.fetchComments(process?.id);
  }

  private _task: Task;

  @Input()
  set task(task: Task) {
    this._task = task;
    this.inputHidden = !task;
    this.fetchComments(task?.processInstanceId);
  }

  @Output() commentsUpdated = new EventEmitter<any>();

  constructor(private bpmService: BpmService, private fb: FormBuilder, private elRef: ElementRef) {}

  addComment() {
    this.bpmService
      .addProcessComment(this._task?.id, this.commentForm.value.comment)
      .pipe(map((comment: ProcessInstanceComment) => this.fetchComments(this._task?.processInstanceId, comment.id)))
      .subscribe();
  }

  /**
   * Fetch comments for a particular process instance
   * @param processInstanceId ID of the process instance to fetch comments for
   * @param focusId ID of the comment to be focused (scrolled into view to ensure visibility)
   */
  private fetchComments(processInstanceId: string, focusId?: string): void {
    this.errorMessage = null;
    if (!processInstanceId) {
      this.comments = [];
      this.commentForm.reset();
      this.commentsUpdated.emit(this.comments);
      return;
    }
    this.busy = true;
    this.bpmService
      .getProcessComments(processInstanceId)
      .pipe(
        map((res: ProcessInstanceComment[]) => {
          this.comments = res || [];
          this.commentsUpdated.emit(this.comments);
          this.focusComment(focusId);
        }),
        catchError((error: Error) => {
          this.errorMessage = error.message;
          return EMPTY;
        })
      )
      .subscribe()
      .add(() => {
        this.busy = false;
        this.commentForm.reset();
      });
  }

  private focusComment(id: string) {
    setTimeout(() => this.elRef.nativeElement.querySelector(id ? `#c${id}` : `.comment:last-child`)?.scrollIntoView(), 200);
  }

  trackByFn(index, item) {
    return item.id;
  }

  ngOnInit(): void {}
}
