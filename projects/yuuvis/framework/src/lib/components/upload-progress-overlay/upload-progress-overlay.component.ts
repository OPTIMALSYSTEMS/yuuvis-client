import { Component, Input } from '@angular/core';
import { ProgressStatus, UploadService } from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { SVGIcons } from './../../svg.generated';
@Component({
  selector: 'yuv-upload-progress-overlay',
  templateUrl: './upload-progress-overlay.component.html',
  styleUrls: ['./upload-progress-overlay.component.scss']
})
export class UploadProgressOverlayComponent {
  icon = {
    minimize: SVGIcons['arrow-down'],
    remove: SVGIcons['clear']
  };
  minimized: boolean;
  progressStatus$: Observable<ProgressStatus>;
  // besides listening to the upload service you may want to use
  // the input to provide the component with data (also nice for testing :)
  @Input()
  set progress(ps: ProgressStatus) {
    this.progressStatus$ = ps ? of(ps) : null;
  }

  constructor(private uploadService: UploadService) {
    this.progressStatus$ = this.uploadService.status$;
  }

  remove(id: string) {
    this.uploadService.cancelItem(id);
  }

  trackByFn(index, item) {
    return item.id;
  }
}
