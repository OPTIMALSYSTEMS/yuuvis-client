import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { FileSizePipe } from '../../pipes/filesize.pipe';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'yuv-file-picker',
  templateUrl: './file-picker.component.html',
  styleUrls: ['./file-picker.component.scss']
})
export class FilePickerComponent {
  @ViewChild('fileInput', { static: true }) fileInputEl: ElementRef;
  /**
   * Label to be used for picker button
   */
  @Input() label: string;
  @Input() accept: string;
  /**
   * Maximum size of the file
   */
  @Input() maxSize: number;
  @Input() output: 'text' | 'dataurl' | 'arraybuffer' = 'arraybuffer';
  @Output() fileSelected = new EventEmitter<FileInputResult>();

  constructor(private notify: NotificationService, private translate: TranslateService) {}

  choose() {
    this.fileInputEl.nativeElement.click();
  }

  fileInputChangeListener(event) {
    const files = event.target.files;
    if (files.length) {
      const file = event.target.files[0];
      if (this.maxSize && file.size > this.maxSize) {
        this.notify.warning(
          this.translate.instant('yuv.framework.filepicker.maxsize.exceeded.title'),
          this.translate.instant('yuv.framework.filepicker.maxsize.exceeded.message', { max: new FileSizePipe(this.translate).transform(this.maxSize) })
        );
      } else {
        let read: Observable<any>;
        switch (this.output) {
          case 'text': {
            read = this.readAsText(file);
            break;
          }
          case 'dataurl': {
            read = this.readAsDataUrl(file);
            break;
          }
          default: {
            read = this.readAsArrayBuffer(file);
          }
        }
        read.subscribe(res => this.fileSelected.emit(res));
        this.fileInputEl.nativeElement.value = null;
      }
    }
  }

  private readAsText(blob: Blob): Observable<string> {
    return new Observable(o => {
      const myReader: FileReader = new FileReader();
      myReader.onerror = err => {
        o.error(err);
        o.complete();
      };
      myReader.onloadend = e => {
        o.next(myReader.result as string);
        o.complete();
      };
      myReader.readAsText(blob);
    });
  }

  private readAsDataUrl(blob: Blob): Observable<string> {
    return new Observable(o => {
      const myReader: FileReader = new FileReader();
      myReader.onerror = err => {
        o.error(err);
        o.complete();
      };
      myReader.onloadend = e => {
        o.next(myReader.result as string);
        o.complete();
      };
      myReader.readAsDataURL(blob);
    });
  }

  private readAsArrayBuffer(blob: Blob): Observable<ArrayBuffer> {
    return new Observable(o => {
      const myReader: FileReader = new FileReader();
      myReader.onerror = err => {
        o.error(err);
        o.complete();
      };
      myReader.onloadend = e => {
        o.next(myReader.result as ArrayBuffer);
        o.complete();
      };
      myReader.readAsArrayBuffer(blob);
    });
  }
}

export interface FileInputResult {
  isImage: boolean;
  extension?: string;
  file: {
    name: string;
    size: number;
    type: string;
  };
  data: ArrayBuffer | string;
}
