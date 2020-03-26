import { Component, OnInit } from '@angular/core';
import { ProgressStatus, Utils } from '@yuuvis/core';
import { Observable, timer } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';
import { UploadResult } from './../../../projects/yuuvis/core/src/lib/service/upload/upload.interface';

@Component({
  selector: 'yuv-test-upload-progress-overlay',
  templateUrl: './test-upload-progress-overlay.component.html',
  styleUrls: ['./test-upload-progress-overlay.component.scss']
})
export class TestUploadProgressOverlayComponent implements OnInit {
  progress: ProgressStatus;

  constructor() {}

  uploadResults: UploadResult[][];

  uploadFake() {
    const count = 5;
    this.uploadResults = [];

    const p = [];
    for (let i = 1; i <= count; i++) {
      const id = Utils.uuid();
      p.push({
        id,
        filename: `filname_with a long filename_nr_${i}.txt`,
        progress: this.getProgressItem(i, id)
      });

      const res = [
        {
          objectId: `id_${i}`,
          contentStreamId: `stream_${i}`,
          filename: `filenam${i}.bin`,
          label: `Upload label #${i}`
        }
      ];

      if (i === 3) {
        res.push({
          objectId: `id_${i}1`,
          contentStreamId: `stream_${i}1`,
          filename: `filenam${i}1.bin`,
          label: `Upload label #${i}1`
        });
        res.push({
          objectId: `id_${i}2`,
          contentStreamId: `stream_${i}2`,
          filename: `filenam${i}2.bin`,
          label: `Upload label #${i}2`
        });
      }

      this.uploadResults.push(res);
    }
    this.progress = { err: 0, items: p };
  }

  private getProgressItem(i: number, id: string): Observable<number> {
    let t = 0;
    return timer(i * 100, i * 100).pipe(
      takeWhile(() => t <= 100),
      tap(() => {
        t++;
        if (t === 100) {
          // this.progress.items = this.progress.items.filter(s => s.id !== id);
          const idx = this.progress.items.findIndex(s => s.id === id);
          this.progress.items[idx].result = this.uploadResults[idx];
        }
      })
    );
  }

  onResultItemClick(event) {
    console.log(event);
  }

  ngOnInit() {}
}
