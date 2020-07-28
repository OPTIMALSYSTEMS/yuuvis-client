import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, Renderer2 } from '@angular/core';
import { Utils } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { FileDropService } from './file-drop.service';

/**
 * Apply `yuvFileDrop` directive to any component or DOM element that should handle
 * files dropped onto it. All host elements using this directive will be highlighted
 * when a user drags a file to the app. Once the file is dragged onto a particular
 * host, this one will be marked as active and indicate that the user can drop the file
 * there.
 */
@Directive({
  selector: '[yuvFileDrop]'
})
export class FileDropDirective implements OnDestroy {
  private id: string;
  private dragEventCount = 1;
  private fileOver: boolean;
  private _invalid: boolean;

  private _options: FileDropOptions = {};
  private overlay: string;
  private highlightOverlay: string;

  /**
   * Emitted once a file (or multiple files) has been dropped on the directives
   * host component. It will provide you with an array of files dropped.
   */
  @Output() yuvFileDrop = new EventEmitter<File[]>();
  /**
   * Options to be applied to the directive. You can use them to disable
   * drop support, allow multiple files instaed of a single file or add
   * a label that will be displayed each time a file is dragged onto the
   * host component.
   */
  @Input() set yuvFileDropOptions(options: FileDropOptions) {
    this._options = options;
  }

  @HostListener('dragenter', ['$event']) onDragEnter(evt: DragEvent) {
    const draggedFiles = this.fileDropService.dragContainsFiles(evt);
    this._invalid = !this._options.multiple && draggedFiles > 1;
    if (!this.fileOver) {
      this.dragEventCount = 1;
      this.fileOver = true;
      this.fileDropService.add(this.id);
    } else {
      this.dragEventCount++;
    }
  }

  @HostListener('dragover', ['$event']) onDragOver(evt: DragEvent) {
    let transfer = this.getTransfer(evt);
    if (!transfer) {
      return;
    }
    transfer.dropEffect = this._options.disabled || this._invalid ? 'none' : 'copy';
    this.preventAndStop(evt);
  }

  @HostListener('dragleave', ['$event']) onDragLeave(evt: DragEvent) {
    this.dragEventCount--;
    if (this.dragEventCount === 0) {
      this.fileOver = false;
      this.fileDropService.remove(this.id);
    }
  }

  @HostListener('drop', ['$event']) onDrop(evt: DragEvent) {
    const transfer = this.getTransfer(evt);
    if (!transfer) {
      return;
    }
    this.preventAndStop(evt);
    // check for directories
    const invalidInput = this._options.disabled || this._invalid || Array.from(transfer.items).some((i: any) => (i.webkitGetAsEntry() || {}).isDirectory);
    if (!invalidInput) {
      this.onFilesDropped(Array.from(transfer.files));
    }
    this.fileDropService.clear();
  }

  /**
   *
   *@ignore
   */
  constructor(private elementRef: ElementRef, private cd: ChangeDetectorRef, private fileDropService: FileDropService, private renderer: Renderer2) {
    this.id = Utils.uuid();
    this.fileDropService.activeDropzone$.pipe(takeUntilDestroy(this)).subscribe((activeZoneId) => {
      // some other dropzone received the files and cleared the file-drop-service
      if (activeZoneId === null) {
        this.fileOver = false;
      }
      this.setActive(activeZoneId === this.id);
    });
    this.renderer.addClass(this.elementRef.nativeElement, 'yuv-file-drop');

    this.fileDropService.fileDraggedOverApp$.pipe(takeUntilDestroy(this)).subscribe((b) => {
      this.setHighlight(b);
    });
  }

  private setActive(a: boolean) {
    if (a && !this._options.disabled && !this._invalid) {
      // add overlay
      const rect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();
      const ov: HTMLElement = document.createElement('div');
      ov.classList.add('yuvFileDropOverlay');
      this.overlay = Utils.uuid();
      ov.setAttribute('id', this.overlay);
      ov.style.cssText = `position: absolute; top: ${rect.top}px; left: ${rect.left}px; width: ${rect.width}px; height: ${rect.height}px;`;
      if (this._options.label) {
        const label: HTMLElement = document.createElement('div');
        label.innerText = this._options.label;
        ov.appendChild(label);
      }
      document.body.appendChild(ov);
    } else if (this.overlay) {
      // remove overlay
      document.body.removeChild(document.getElementById(this.overlay));
      this.overlay = null;
    }
  }

  private setHighlight(highlight: boolean) {
    if (highlight && !this._options.disabled && !this._invalid) {
      // add overlay
      const rect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();
      const ov: HTMLElement = document.createElement('div');
      ov.classList.add('yuvFileDropOverlay');
      ov.classList.add('highlight');
      this.highlightOverlay = Utils.uuid();
      ov.setAttribute('id', this.highlightOverlay);
      ov.style.cssText = `position: absolute; top: ${rect.top}px; left: ${rect.left}px; width: ${rect.width}px; height: ${rect.height}px;`;
      document.body.appendChild(ov);
    } else if (this.highlightOverlay) {
      // remove overlay
      document.body.removeChild(document.getElementById(this.highlightOverlay));
      this.highlightOverlay = null;
    }
  }

  private onFilesDropped(files: File[]) {
    this.yuvFileDrop.emit(files);
  }

  private preventAndStop(event: any): any {
    event.preventDefault();
    event.stopPropagation();
  }

  private getTransfer(event: any): any {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
  }

  ngOnDestroy() {}
}

/**
 * Providing options for a `FileDropDirective`.
 */
export interface FileDropOptions {
  /**
   * label to be printed on the overlay
   */
  label?: string;
  /**
   * if set to true drop target will be disabled and not accept any files dropped
   */
  disabled?: boolean;
  /**
   * if set to true supports multiple files being dropped
   */
  multiple?: boolean;
}
