import { Component, OnInit } from '@angular/core';
import { ProgressStatus, Utils } from '@yuuvis/core';
import { Observable, timer } from 'rxjs';
import { takeWhile, tap } from 'rxjs/operators';

@Component({
  selector: 'yuv-test-upload-progress-overlay',
  templateUrl: './test-upload-progress-overlay.component.html',
  styleUrls: ['./test-upload-progress-overlay.component.scss']
})
export class TestUploadProgressOverlayComponent implements OnInit {
  progress: ProgressStatus[];

  constructor() {}

  uploadFake() {
    const count = 5;
    const p = [];
    for (let i = 1; i <= count; i++) {
      const id = Utils.uuid();
      p.push({
        id: id,
        filename: `filname_nr_${i}.txt`,
        progress: this.getProgressItem(i, id)
      });
    }
    this.progress = p;
  }

  private getProgressItem(i: number, id: string): Observable<number> {
    let t = 0;
    return timer(i * 100, i * 1000).pipe(
      takeWhile(() => t <= 100),
      tap(() => {
        t++;
        if (t === 100) {
          this.progress = this.progress.filter(s => s.id !== id);
        }
      })
    );
  }

  ngOnInit() {}
}
