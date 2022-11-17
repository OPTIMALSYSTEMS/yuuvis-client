import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BpmEvent, EventService, InboxService, Process, ProcessService, Task, TranslateService, Utils } from '@yuuvis/core';
import { of } from 'rxjs';
import { finalize, map, switchMap, tap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService } from '../../../../services/notification/notification.service';
import { hasRequiredField } from '../../../../shared/utils';
import { ActionComponent } from './../../../interfaces/action-component.interface';

@UntilDestroy()
@Component({
  selector: 'yuv-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.scss']
})
export class FollowUpComponent implements OnInit, OnDestroy, ActionComponent {
  form: UntypedFormGroup;
  currentFollowUp: Process;
  showDeleteTemp = false;
  folder = '';
  secondForm: UntypedFormGroup;
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
    private fb: UntypedFormBuilder,
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
        untilDestroyed(this)
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
        untilDestroyed(this)
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
        untilDestroyed(this)
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
        untilDestroyed(this),
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
    this.currentFollowUp = process;
    const { id: documentId, title } = this.selection[0];
    const variables = process?.variables;

    this.hasCurrentFollowUp
      ? this.form.patchValue({
          expiryDateTime: variables?.find((v) => v.name === 'expiryDateTime')?.value,
          whatAbout: this.currentFollowUp.subject,
          documentId
        })
      : this.form.patchValue({ whatAbout: (title ? `${title}: ` : '') as string, documentId });
    this.headline = this.hasCurrentFollowUp
      ? this.translate.instant('yuv.framework.action-menu.action.follow-up.edit.title')
      : this.translate.instant('yuv.framework.action-menu.action.follow-up.create.title');
    this.form.markAsPristine();

    if (task) {
      this.canConfirmTask = true;
      this.form.disable();
      this.disabledForm = true;
    }
    return process;
  }

  ngOnInit() {
    this.loading = true;
    this.processService
      .getFollowUp(this.selection[0].id, {
        includeProcessVar: true,
        isCompleted: false
      })
      .pipe(
        switchMap((process: Process) =>
          process
            ? this.processService.getFollowUpTask(process?.id).pipe(map((task) => ({ process, task: task ? task[0] : null })))
            : of({ process: null, task: null })
        ),
        map(({ process, task }: { process: Process; task: Task }) => this.processProcessData(process, task)),
        untilDestroyed(this),
        finalize(() => (this.loading = false))
      )
      .subscribe();
  }

  ngOnDestroy() {}
}
