import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable, ReplaySubject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

/**
 * Service that manages state for components that deal with drag and drop.
 * Using `yuvFileDrop` directive you can enable any component to handle files
 * dropped onto it.
 */
@Injectable({
  providedIn: 'root'
})
export class FileDropService {
  private dropzones = [];
  private dragEventCount = 0;
  private activeDropzone;
  private fileOver: boolean;
  private activeDropzoneSource = new ReplaySubject<string>();
  private fileDraggedOverAppSource = new ReplaySubject<boolean>();

  /**
   * Emits the dropzone that is currently active (dragged over).
   */
  public activeDropzone$: Observable<string> = this.activeDropzoneSource.asObservable();
  /**
   * Emits whether or not a file was dragged over the application
   */
  public fileDraggedOverApp$: Observable<boolean> = this.fileDraggedOverAppSource.asObservable();

  /**
   * @ignore
   */
  constructor() {
    merge(fromEvent(document, 'dragenter'), fromEvent(document, 'dragleave'), fromEvent(document, 'drop'))
      .pipe(
        map((event: DragEvent) => {
          if (event.type === 'dragenter' && this.dragContainsFiles(event) > 0) {
            this.dragEventCount++;
          } else if (event.type === 'dragleave' && this.dragEventCount > 0) {
            this.dragEventCount--;
          } else if (event.type === 'drop') {
            this.dragEventCount = 0;
          }
          return this.dragEventCount !== 0;
        }),
        filter((b) => b !== this.fileOver),
        tap((b) => (this.fileOver = b))
      )
      .subscribe((b) => this.fileDraggedOverAppSource.next(b));
  }

  /**
   * Adds a new dropzone to the list of managed dropzones
   * @param id ID of the dropzone
   */
  add(id: string) {
    if (!this.dropzones.includes(id)) {
      this.dropzones.push(id);
    }
    this.setActive(id);
  }

  /**
   * Removes a dropzone from the managed list of dropzones
   * @param id ID of the dropzone to be removed
   */
  remove(id) {
    this.dropzones = this.dropzones.filter((d) => d !== id);
    this.setActive(this.dropzones[this.dropzones.length - 1]);
  }

  /**
   * Reset the state of the service. Removes all dropzones.
   */
  clear() {
    this.dropzones = [];
    this.setActive(null);
    this.dragEventCount = 0;
    this.fileOver = false;
    this.fileDraggedOverAppSource.next(false);
  }

  /**
   * Indicates whether or not the current drag event contains one or more files.
   * @param event - the drag event to be checked
   * @returns number of files
   */
  dragContainsFiles(event: DragEvent): number {
    // do not allow to drop files/images from iframes
    if ((event.relatedTarget as Element)?.tagName.toLowerCase() === 'iframe') return 0;
    return Array.from(event.dataTransfer.items || []).filter((i) => i.kind === 'file').length;
  }

  private setActive(id) {
    if (this.activeDropzone !== id) {
      this.activeDropzone = id;
      this.activeDropzoneSource.next(this.activeDropzone);
    }
  }
}
