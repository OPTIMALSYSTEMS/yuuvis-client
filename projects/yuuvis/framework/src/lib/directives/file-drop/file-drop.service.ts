import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, ReplaySubject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileDropService {
  private dropzones = [];
  private dragEventCount = 0;
  private activeDropzone;
  private activeDropzoneSource = new ReplaySubject<string>();
  public activeDropzone$: Observable<string> = this.activeDropzoneSource.asObservable();

  /**
   * Emits whether or not a file was dragged over the application
   */
  private fileDraggedOverAppSource = new ReplaySubject<boolean>();
  public fileDraggedOverApp$: Observable<boolean> = this.fileDraggedOverAppSource.asObservable();
  private fileOver: boolean;

  constructor() {
    merge(fromEvent(document, 'dragenter'), fromEvent(document, 'dragleave'))
      .pipe(
        map((event: DragEvent) => {
          if (event.type === 'dragenter' && this.dragContainsFiles(event) > 0) {
            this.dragEventCount++;
          }
          if (event.type === 'dragleave') {
            this.dragEventCount--;
          }
          return this.dragEventCount !== 0;
        }),
        filter((b) => b !== this.fileOver),
        tap((b) => (this.fileOver = b))
      )
      .subscribe((b) => this.fileDraggedOverAppSource.next(b));
  }

  add(id: string) {
    if (!this.dropzones.includes(id)) {
      this.dropzones.push(id);
    }
    this.setActive(id);
  }
  remove(id) {
    this.dropzones = this.dropzones.filter((d) => d !== id);
    this.setActive(this.dropzones[this.dropzones.length - 1]);
  }

  clear() {
    this.dropzones = [];
    this.setActive(null);
  }

  /**
   * Indicates whether or not the current drag event contains one or more files.
   * Microsoft Edge 42.17134.1.0 will always includes 'File' there for we need to check for Edge and dataTransfer length.
   *
   * @param event - the drag event to be checked
   * @returns the number of files dragged
   */
  dragContainsFiles(event: DragEvent): number {
    const { types } = event.dataTransfer;
    if (types) {
      if (types.includes('Files')) {
        return event.dataTransfer.items.length;
      }
    }
    return 0;
  }

  private setActive(id) {
    if (this.activeDropzone !== id) {
      this.activeDropzone = id;
      this.activeDropzoneSource.next(this.activeDropzone);
    }
  }
}
