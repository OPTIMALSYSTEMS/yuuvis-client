import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProgressStatus, UploadResult, UploadService } from '@yuuvis/core';
import { forkJoin, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SVGIcons } from './../../svg.generated';

@Component({
  selector: 'yuv-upload-progress-overlay',
  templateUrl: './upload-progress-overlay.component.html',
  styleUrls: ['./upload-progress-overlay.component.scss']
})
export class UploadProgressOverlayComponent {
  icon = {
    minimize: SVGIcons['arrow-down'],
    remove: SVGIcons['clear'],
    done: SVGIcons['done']
  };
  minimized: boolean;
  allDone: boolean;
  progressStatus$: Observable<ProgressStatus>;
  completed$: Observable<boolean>;

  // besides listening to the upload service you may want to use
  // the input to provide the component with data (also nice for testing :)
  @Input()
  set progress(ps: ProgressStatus) {
    this.progressStatus$ = ps ? of(ps) : null;
    this.runningProcess(ps);
  }

  @Output() resultItemClick = new EventEmitter<UploadResult>();

  constructor(private uploadService: UploadService) {
    this.progressStatus$ = this.uploadService.status$.pipe(tap(r => this.runningProcess(r)));
  }

  private runningProcess(ps: ProgressStatus) {
    forkJoin(ps.items.map(p => p.progress)).subscribe(
      results => (this.completed$ = of(true)),
      err => (this.completed$ = of(true))
    );
  }

  openObject(item: UploadResult) {
    this.resultItemClick.emit(item);
  }

  remove(id: string) {
    this.uploadService.cancelItem(id);
  }

  trackByFn(index, item) {
    return item.id;
  }
}
