import { Component, OnInit } from '@angular/core';
import { UploadService } from '@yuuvis/core';
@Component({
  selector: 'yuv-upload-progress-overlay',
  templateUrl: './upload-progress-overlay.component.html',
  styleUrls: ['./upload-progress-overlay.component.scss']
})
export class UploadProgressOverlayComponent implements OnInit {
  progressStatus: any = {};
  showOverlay = false;

  constructor(private uploadService: UploadService) {
    this.uploadService.status$.subscribe(status => {
      if (Object.keys(status).length === 0) {
        this.showOverlay = false;
      } else {
        this.showOverlay = true;
      }
      this.progressStatus = status;
    });
  }

  ngOnInit() {}
}
