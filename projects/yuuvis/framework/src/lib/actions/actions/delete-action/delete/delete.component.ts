import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { BackendService, DmsObject, DmsService, EventService, TranslateService } from '@yuuvis/core';
import { NotificationService } from '../../../../services/notification/notification.service';
import { ActionComponent } from '../../../interfaces/action-component.interface';

/**
 * @ignore
 */

@Component({
  selector: 'yuv-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent implements OnInit, ActionComponent {

  private readonly translate = inject(TranslateService);
  readonly #backend = inject(BackendService);
  readonly #dmsService = inject(DmsService);
  readonly #eventService = inject(EventService);
  readonly #notificationService = inject(NotificationService);
  deleting = false;
  folder = '';
  count = '...';

  @Input() selection: any[];

  @Output() finished: EventEmitter<any> = new EventEmitter<any>();

  @Output() canceled: EventEmitter<any> = new EventEmitter<any>();

  deleteDmsObject(dmsObject: DmsObject) {
    this.#dmsService.deleteDmsObject(dmsObject.id).subscribe({
      next: () => {
        this.#notificationService.success(
          this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.done.title'),
          this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.done.message')
        );
        this.#eventService.trigger('dmsObjectDeleted', dmsObject);
        this.finished.emit();
      },
      error: (error) => {
        let status = error.status;
        if (error.error) {
          status = error.error.serviceErrorCode;
        }
        switch (status) {
          case 403:
            this.#notificationService.error(this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.error.403'));
            break;
          case 409:
            this.#notificationService.error(this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.error.409'));
            break;
          // serviceErrorCode: A non-empty folder cannot be deleted
          case 2800:
            this.#notificationService.error(this.translate.instant('yuv.framework.action-menu.action.delete.dms.object.error.2800'));
            break;
        }
        this.finished.emit();
      }
    });
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