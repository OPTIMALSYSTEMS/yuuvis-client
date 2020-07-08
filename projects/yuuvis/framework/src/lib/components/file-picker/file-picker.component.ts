import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { FileSizePipe } from '../../pipes/filesize.pipe';
import { NotificationService } from '../../services/notification/notification.service';
/**
 * Responsible for importing third-party files.
 * 
 * [Screenshot](../assets/images/yuv-file-picker.gif)
 * 
 * @example
 *   <yuv-file-picker [label]="'name.of.picker.button' | translate" [output]="'file'"
      [multiple]="true" (nameOfSelectedFunction)="fileChosen($event)"></yuv-file-picker>
 */
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

  /**
   * Data type, wich can be accepted in your client
   */
  @Input() accept: string;

  /**
   * Regulates multiple or single file selection
   */
  @Input() multiple: boolean;
  /**
   * Maximum size of the file
   */
  @Input() maxSize: number;
  /**
   * Data type in output
   */
  @Input() output: 'text' | 'dataurl' | 'arraybuffer' | 'file' = 'file';

  /**
   * Emittet when file has been selected.
   */
  @Output() fileSelected = new EventEmitter<FileInputResult>();

  constructor(private notify: NotificationService, private renderer: Renderer2, private translate: TranslateService) {}

  choose() {
    if (this.multiple) {
      this.renderer.setAttribute(this.fileInputEl.nativeElement, 'multiple', 'multiple');
    } else {
      this.renderer.removeAttribute(this.fileInputEl.nativeElement, 'multiple');
    }
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
        if (this.multiple) {
          this.fileSelected.emit(files);
        } else {
          let read: Observable<any>;
          switch (this.output) {
            case 'arraybuffer': {
              read = this.readAsArrayBuffer(file);
              break;
            }
            case 'text': {
              read = this.readAsText(file);
              break;
            }
            case 'dataurl': {
              read = this.readAsDataUrl(file);
              break;
            }
            default: {
              this.fileSelected.emit(file);
            }
          }
          read.subscribe((res) => this.fileSelected.emit(res));
        }
      }
      this.fileInputEl.nativeElement.value = null;
    }
  }

  private readAsText(blob: Blob): Observable<string> {
    return new Observable((o) => {
      const myReader: FileReader = new FileReader();
      myReader.onerror = (err) => {
        o.error(err);
        o.complete();
      };
      myReader.onloadend = (e) => {
        o.next(myReader.result as string);
        o.complete();
      };
      myReader.readAsText(blob);
    });
  }

  private readAsDataUrl(blob: Blob): Observable<string> {
    return new Observable((o) => {
      const myReader: FileReader = new FileReader();
      myReader.onerror = (err) => {
        o.error(err);
        o.complete();
      };
      myReader.onloadend = (e) => {
        o.next(myReader.result as string);
        o.complete();
      };
      myReader.readAsDataURL(blob);
    });
  }

  private readAsArrayBuffer(blob: Blob): Observable<ArrayBuffer> {
    return new Observable((o) => {
      const myReader: FileReader = new FileReader();
      myReader.onerror = (err) => {
        o.error(err);
        o.complete();
      };
      myReader.onloadend = (e) => {
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
