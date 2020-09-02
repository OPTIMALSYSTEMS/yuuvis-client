import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InboxService, ProcessData, ProcessService, TaskData, TranslateService, Utils } from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { NotificationService } from '../../../../services/notification/notification.service';
import { ActionComponent } from './../../../interfaces/action-component.interface';

@Component({
  selector: 'yuv-follow-up',
  templateUrl: './follow-up.component.html',
  styleUrls: ['./follow-up.component.scss']
})
export class FollowUpComponent implements OnInit, ActionComponent {
  form: FormGroup;
  currentFollowUp: ProcessData;
  showDeleteTemp = false;
  folder = '';
  secondForm: FormGroup;
  canConfirmTask = false;
  disabledForm = false;
  headline: string;

  @Input() selection: any[];
  @Output() finished: EventEmitter<any> = new EventEmitter();
  @Output() canceled: EventEmitter<any> = new EventEmitter();

  constructor(
    private processService: ProcessService,
    private inboxService: InboxService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {
    this.form = this.fb.group({
      expiryDateTime: [],
      whatAbout: '',
      documentId: null
    });
    this.form.controls.expiryDateTime.setValidators(Validators.required);
  }

  createFollowUp() {
    this.processService.createFollowUp(this.selection[0].id, this.form.value).subscribe(() => {
      this.notificationService.success(
        this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
        this.translate.instant('yuv.framework.action-menu.action.follow-up.done.message')
      );
      this.finished.emit();
    });
  }

  editFollowUp() {
    this.processService.editFollowUp(this.selection[0].id, this.currentFollowUp.id, this.form.value).subscribe(() => {
      this.notificationService.success(
        this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
        this.translate.instant('yuv.framework.action-menu.action.follow-up.edit.done.message')
      );
      this.finished.emit();
    });
  }

  deleteFollowUp() {
    this.processService.deleteFollowUp(this.currentFollowUp.id).subscribe(() => {
      this.notificationService.success(
        this.translate.instant('yuv.framework.action-menu.action.follow-up.label'),
        this.translate.instant('yuv.framework.action-menu.action.follow-up.delete.message')
      );
      this.finished.emit();
    });
    this.showDeleteTemp = false;
  }

  cancel() {
    this.canceled.emit();
    this.showDeleteTemp = false;
  }

  confirmTask() {
    this.inboxService
      .completeTask(this.currentFollowUp.taskId)
      .pipe(
        tap(() => this.finished.emit()),
        switchMap(() => this.shouldRefreshList())
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

  private shouldRefreshList(): Observable<TaskData[] | ProcessData[]> {
    return this.activatedRoute.snapshot.url[0].path === 'inbox'
      ? this.inboxService.getTasks()
      : this.activatedRoute.snapshot.url[0].path === 'processes'
      ? this.processService.getProcesses()
      : of(null);
  }

  private processProcessData(process: ProcessData, task: TaskData) {
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
    this.processService
      .getFollowUp(this.selection[0].id)
      .pipe(
        switchMap((process: ProcessData) =>
          process ? this.inboxService.getTask(process?.id).pipe(map((task) => ({ process, task: task[0] }))) : of({ process: null, task: null })
        ),
        map(({ process, task }: { process: ProcessData; task: TaskData }) => this.processProcessData(process, task))
      )
      .subscribe();
    this.showDeleteTemp = false;
  }
}
