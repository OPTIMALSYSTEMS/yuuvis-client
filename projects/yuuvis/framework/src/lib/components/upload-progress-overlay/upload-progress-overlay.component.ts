import { Component } from '@angular/core';
import { UploadService } from '@yuuvis/core';
@Component({
  selector: 'yuv-upload-progress-overlay',
  templateUrl: './upload-progress-overlay.component.html',
  styleUrls: ['./upload-progress-overlay.component.scss']
})
export class UploadProgressOverlayComponent {
  progressStatus: any = {};
  showOverlay = false;
  lastRunningUploadsCount = 0;

  constructor(private uploadService: UploadService) {
    this.uploadService.status$.subscribe(status => this.handleNewProgressStatus(status));
  }

  private handleNewProgressStatus(status) {
    const runningUploadsCount = Object.keys(status).length;
    if (runningUploadsCount === 0) {
      this.showOverlay = false;
    } else if (runningUploadsCount > this.lastRunningUploadsCount) {
      this.showOverlay = true;
    }
    this.lastRunningUploadsCount = runningUploadsCount;
    this.progressStatus = status;
  }
}
