import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ProgressStatus, UploadResult, UploadService } from '@yuuvis/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { clear, done } from './../../svg.generated';

/**
 * Component is responsible for uploading third-party files to the client.
 * @example
 *  <yuv-upload-progress-overlay (onClickFunction)="onClick($event)"></yuv-upload-progress-overlay>
 */
@Component({
  selector: 'yuv-upload-progress-overlay',
  templateUrl: './upload-progress-overlay.component.html',
  styleUrls: ['./upload-progress-overlay.component.scss']
})
export class UploadProgressOverlayComponent {
  // minimized: boolean;
  allDone: boolean;
  progressStatus$: Observable<ProgressStatus>;
  completed: boolean;
  completedUp$: Observable<boolean>;
  @ViewChild('uploadsOverlay') uploadsOverlay: OverlayPanel;
  /**
   * listen to the upload service and provide the component with data
   */
  @Input()
  set progress(ps: ProgressStatus) {
    this.progressStatus$ = ps ? of(ps) : null;
  }

  /**
   * Emittet when an upload status panel has been opend.
   */
  @Output() resultItemClick = new EventEmitter<UploadResult>();

  constructor(private uploadService: UploadService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([clear, done]);
    this.progressStatus$ = this.uploadService.status$.pipe(
      tap((s) => {
        if (!s.items.length && this.uploadsOverlay) {
          this.uploadsOverlay.hide();
        }
      })
    );
    this.completedUp$ = this.uploadService.uploadStatus$;
  }

  openObject(item: UploadResult) {
    this.resultItemClick.emit(item);
  }

  remove(id?: string) {
    this.uploadService.cancelItem(id);
  }

  trackByFn(index, item) {
    return item.id;
  }
}
