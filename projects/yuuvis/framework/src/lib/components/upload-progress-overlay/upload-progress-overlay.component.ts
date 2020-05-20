import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ProgressStatus, UploadResult, UploadService } from '@yuuvis/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { clear, done } from './../../svg.generated';
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

  // besides listening to the upload service you may want to use
  // the input to provide the component with data (also nice for testing :)
  @Input()
  set progress(ps: ProgressStatus) {
    this.progressStatus$ = ps ? of(ps) : null;
  }

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
