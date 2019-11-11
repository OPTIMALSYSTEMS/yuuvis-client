import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseObjectTypeField, CreateObjectResult, ProgressStatus, UploadService } from '@yuuvis/core';
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

  constructor(private uploadService: UploadService, private router: Router, private route: ActivatedRoute) {
    this.progressStatus$ = this.uploadService.status$;
  }

  openObject(item: CreateObjectResult) {
    this.uploadService.removeResultItem(item.contentStreams[0].contentStreamId);
    this.router.navigate(['/object', item.properties[BaseObjectTypeField.OBJECT_ID].value]);
  }

  removeResult(item: CreateObjectResult) {
    this.uploadService.removeResultItem(item.contentStreams[0].contentStreamId);
  }

  remove(id: string) {
    this.uploadService.cancelItem(id);
  }

  trackByFn(index, item) {
    return item.id;
  }
}
