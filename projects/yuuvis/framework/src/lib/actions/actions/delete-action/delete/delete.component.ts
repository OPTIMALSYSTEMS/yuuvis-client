import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BackendService, DmsObject, DmsService, EventService, TranslateService, YuvEventType } from '@yuuvis/core';
import { NotificationService } from '../../../../services/notification/notification.service';
import { ActionComponent } from '../../../interfaces/action-component.interface';

/**
 * This component is a part of the action menu and is responsible for deleting selected objects.
 *
 * [Screenshot](../assets/images/yuv-action-delete.gif)
 *
 * @example
 * <yuv-delete [selection]="selection" (finished)="deleteEvent()" (canceled)="canceledDeleteEvent()"></yuv-delete>
 *
 */

@Component({
  selector: 'yuv-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit, ActionComponent {
  deleting = false;
  folder = '';
  count = '...';
  /**
   * Specifies the object for which the actions should be provided.
   */
  @Input() selection: any[];

  /**
   * Provides the delete action for selected object
   */
  @Output() finished: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Cancels the object deletion
   */
  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private translate: TranslateService,
    private backend: BackendService,
    private dmsService: DmsService,
    private eventService: EventService,
    private notificationService: NotificationService
  ) {}

  deleteDmsObject(dmsObject: DmsObject) {
    this.dmsService.deleteDmsObject(dmsObject.id).subscribe(
      () => {
        this.notificationService.success(
          this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.done.title'),
          this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.done.message')
        );

        this.eventService.trigger(YuvEventType.DMS_OBJECT_DELETED, this.selection[0]);

        this.finished.emit();
      },
      (error) => {
        switch (error.status) {
          case 403:
            this.notificationService.error(this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.error.403'));
            break;
          case 409:
            this.notificationService.error(this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.error.409'));
            break;
        }
        this.finished.emit();
      }
    );
  }

  run() {
    this.deleting = true;
    this.deleteDmsObject(this.selection[0] as DmsObject);
  }

  cancel() {
    this.canceled.emit();
  }

  ngOnInit() {
    if (this.selection[0].isFolder) {
      this.folder = this.selection[0].title;
    }
  }
}
