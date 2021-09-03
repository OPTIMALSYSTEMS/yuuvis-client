import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BpmEvent, EventService, InboxService, Process, ProcessService, Task, TranslateService, Utils } from '@yuuvis/core';
import { of } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { NotificationService } from '../../../../services/notification/notification.service';
import { hasRequiredField } from '../../../../shared/utils';
import { ActionComponent } from './../../../interfaces/action-component.interface';

@Component({
  selector: 'yuv-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.scss']
})
export class FollowUpComponent implements OnInit, OnDestroy, ActionComponent {
  form: FormGroup;
  currentFollowUp: Process;
  showDeleteTemp = false;
  folder = '';
  secondForm: FormGroup;
  canConfirmTask = false;
  disabledForm = false;
  headline: string;
  loading = false;

  @Input() selection: any[];
  @Output() finished: EventEmitter<any> = new EventEmitter();
  @Output() canceled: EventEmitter<any> = new EventEmitter();

  constructor(
    private processService: ProcessService,
    private inboxService: InboxService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private eventService: EventService
  ) {
    this.form = this.fb.group({
      expiryDateTime: ['', Validators.required],
      whatAbout: ['', Validators.required]
    });
  }

  isRequired(field: string): boolean {
    return hasRequiredField(this.form.controls[field]);
  }

  createFollowUp() {
    this.loading = true;
    this.processService
      .createFollowUp(this.selection[0].id, this.form.value.whatAbout, this.form.value.expiryDateTime)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroy(this)
      )
      .subscribe(() => {
        this.notificationService.success(
          this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
          this.translate.instant('yuv.framework.action-menu.action.follow-up.done.message')
        );
        this.finished.emit();
        this.eventService.trigger(BpmEvent.BPM_EVENT);
      });
  }

  editFollowUp() {
    this.loading = true;
    this.processService
      .editFollowUp(this.selection[0].id, this.currentFollowUp.id, this.form.value.whatAbout, this.form.value.expiryDateTime)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroy(this)
      )
      .subscribe(() => {
        this.notificationService.success(
          this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
          this.translate.instant('yuv.framework.action-menu.action.follow-up.edit.done.message')
        );
        this.finished.emit();
        this.eventService.trigger(BpmEvent.BPM_EVENT);
      });
  }

  deleteFollowUp() {
    this.loading = true;
    this.processService
      .deleteProcess(this.currentFollowUp.id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.showDeleteTemp = false;
        }),
        takeUntilDestroy(this)
      )
      .subscribe(() => {
        this.notificationService.success(
          this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
          this.translate.instant('yuv.framework.action-menu.action.follow-up.delete.message')
        );
        this.finished.emit();
        this.eventService.trigger(BpmEvent.BPM_EVENT);
      });
  }

  cancel() {
    this.canceled.emit();
    this.showDeleteTemp = false;
  }

  confirmTask() {
    this.loading = true;
    this.inboxService
      .completeTask(this.currentFollowUp.id)
      .pipe(
        tap(() => {
          this.finished.emit();
          this.eventService.trigger(BpmEvent.BPM_EVENT);
        }),
        takeUntilDestroy(this),
        finalize(() => (this.loading = false))
      )
      .subscribe(
        () => {
          this.notificationService.success(
            this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
            this.translate.instant('yuv.framework.action-menu.action.follow-up.confirm.success.message')
          );
        },
        (error) => {
          this.notificationService.error(
            this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
            this.translate.instant('yuv.framework.action-menu.action.follow-up.confirm.error.message')
          );
        }
      );
  }

  get hasCurrentFollowUp(): boolean {
    return !Utils.isEmpty(this.currentFollowUp);
  }

  private processProcessData(process: Process, task: Task) {
    this.currentFollowUp = { ...process, ...(task && { taskId: task?.id }) };
    const { id: documentId, title } = this.selection[0];
    const variables = process?.variables;

    this.hasCurrentFollowUp
      ? this.form.patchValue({
          expiryDateTime: variables?.find((v) => v.name === 'expiryDateTime').value,
          whatAbout: variables?.find((v) => v.name === 'whatAbout').value as string,
          documentId
        })
      : this.form.patchValue({ whatAbout: (title ? `${title}: ` : '') as string, documentId });
    this.headline = this.hasCurrentFollowUp
      ? this.translate.instant('yuv.framework.action-menu.action.follow-up.edit.title')
      : this.translate.instant('yuv.framework.action-menu.action.follow-up.create.title');
    this.form.markAsPristine();

    if (!!task || this.activatedRoute.snapshot.url[0].path === 'inbox') {
      this.canConfirmTask = true;
      this.form.disable();
      this.disabledForm = true;
    }
    return process;
  }

  ngOnInit() {
    this.loading = true;
    this.processService
      .getFollowUp(this.selection[0].id)
      .pipe(
        switchMap((process: Process) =>
          process ? this.inboxService.getTask(process?.id).pipe(map((task) => ({ process, task: task[0] }))) : of({ process: null, task: null })
        ),
        map(({ process, task }: { process: Process; task: Task }) => this.processProcessData(process, task)),
        takeUntilDestroy(this),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

  ngOnDestroy() {}
}
