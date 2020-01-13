import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { ProgressStatus, UploadResult, UploadService } from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { clear, done } from './../../svg.generated';
@Component({
  selector: 'yuv-upload-progress-overlay',
  templateUrl: './upload-progress-overlay.component.html',
  styleUrls: ['./upload-progress-overlay.component.scss']
})
export class UploadProgressOverlayComponent {
  minimized: boolean;
  allDone: boolean;
  progressStatus$: Observable<ProgressStatus>;
  completed: boolean;
  completedUp$: Observable<boolean>;

  // besides listening to the upload service you may want to use
  // the input to provide the component with data (also nice for testing :)
  @Input()
  set progress(ps: ProgressStatus) {
    this.progressStatus$ = ps ? of(ps) : null;
  }

  @Output() resultItemClick = new EventEmitter<UploadResult>();

  constructor(private uploadService: UploadService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([clear, done]);
    this.progressStatus$ = this.uploadService.status$;
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
