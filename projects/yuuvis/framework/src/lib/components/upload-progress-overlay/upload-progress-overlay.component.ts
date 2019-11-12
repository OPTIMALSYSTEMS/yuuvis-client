import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressStatus, UploadResult, UploadService } from '@yuuvis/core';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
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
  running$: Observable<boolean>;

  // besides listening to the upload service you may want to use
  // the input to provide the component with data (also nice for testing :)
  @Input()
  set progress(ps: ProgressStatus) {
    this.progressStatus$ = ps ? of(ps) : null;
    this.progressStatus$.pipe(switchMap(ps => forkJoin(ps.items.map(i => i.progress))));
    // this.running$ = forkJoin(ps.items.map(p => p.progress)).pipe(

    // )
  }
  @Output() resultItemClick = new EventEmitter<UploadResult>();

  constructor(private uploadService: UploadService, private router: Router, private route: ActivatedRoute) {
    this.progressStatus$ = this.uploadService.status$.pipe(tap(r => console.log(r)));
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
