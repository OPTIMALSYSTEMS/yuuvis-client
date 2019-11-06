import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, Renderer2 } from '@angular/core';
import { Utils } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { FileDropService } from './file-drop.service';

@Directive({
  selector: '[yuvFileDrop]'
})
export class FileDropDirective implements OnDestroy {
  private id: string;
  private dragEventCount = 1;
  private fileOver: boolean;
  private _disabled: boolean;
  private _invalid: boolean;
  private _multiple: boolean;
  private overlay: string;

  @Output() yuvFileDrop = new EventEmitter<File | File[]>();
  @Input() set yuvFileDropOptions(options: FileDropOptions) {
    this._disabled = options.disabled;
    this._multiple = options.multiple;
  }

  @HostListener('dragenter', ['$event']) onDragEnter(evt: DragEvent) {
    const draggedFiles = this.dragContainsFiles(evt);
    this._invalid = !this._multiple && draggedFiles > 1;
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
    transfer.dropEffect = this._disabled || this._invalid ? 'none' : 'copy';
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
    let transfer = this.getTransfer(evt);
    if (!transfer) {
      return;
    }
    this.preventAndStop(evt);
    // check for directories
    let invalidInput: boolean;
    for (let i = 0; i < transfer.items.length; i++) {
      const fe = transfer.items[i].webkitGetAsEntry();
      if (fe.isDirectory || this._disabled || this._invalid) {
        invalidInput = true;
      }
    }
    if (!invalidInput) {
      this.onFilesDropped(Array.from(transfer.files));
    }
    this.fileDropService.clear();
  }

  constructor(private elementRef: ElementRef, private fileDropService: FileDropService, private renderer: Renderer2) {
    this.id = Utils.uuid();
    this.fileDropService.activeDropzone$.pipe(takeUntilDestroy(this)).subscribe(activeZoneId => {
      // some other dropzone received the files and cleared the file-drop-service
      if (activeZoneId === null) {
        this.fileOver = false;
      }
      this.setActive(activeZoneId === this.id);
    });
    this.renderer.addClass(this.elementRef.nativeElement, 'yuv-file-drop');
  }

  private setActive(a: boolean) {
    if (a) {
      this.addOverlay();
    } else {
      this.removeOverlay();
    }
  }

  private addOverlay() {
    const rect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();
    const ov: HTMLElement = document.createElement('div');
    const background = this._disabled || this._invalid ? 'rgba(0,0,0,.1)' : 'rgba(var(--color-accent-rgb), 0.4)';
    this.overlay = Utils.uuid();
    ov.setAttribute('id', this.overlay);
    ov.style.cssText = `animation: yuvFadeIn 200ms; position: absolute; pointer-events: none; top: ${rect.top}px; left: ${rect.left}px; width: ${rect.width}px; height: ${rect.height}px; background: ${background}`;
    document.body.appendChild(ov);
  }

  private removeOverlay() {
    if (this.overlay) {
      document.body.removeChild(document.getElementById(this.overlay));
      this.overlay = null;
    }
  }

  private onFilesDropped(files: File[]) {
    this.yuvFileDrop.emit(this._multiple ? files : files[0]);
  }

  /**
   * Indicates whether or not the current drag event contains one or more files.
   * Microsoft Edge 42.17134.1.0 will always includes 'File' there for we need to check for Edge and dataTransfer length.
   *
   * @param event - the drag event to be checked
   * @returns the number of files dragged
   */
  private dragContainsFiles(event: DragEvent): number {
    const { types } = event.dataTransfer;
    if (types) {
      if (types.includes('Files')) {
        // if (this.isOldEdge()) {
        //   return types.length === 1 && types[0] === 'Files';
        // }
        return event.dataTransfer.items.length;
      }

      // for (let i = 0; i < types.length; i++) {
      //   if (types[i] === 'Files') {
      //     if (this.isOldEdge()) {
      //       return types.length === 1 && types[0] === 'Files';
      //     }
      //     return true;
      //   }
      // }
    }
    return 0;
  }

  // private isOldEdge() {
  //   return !!navigator.userAgent && navigator.userAgent.indexOf('Edge') > -1;
  // }

  private preventAndStop(event: any): any {
    event.preventDefault();
    event.stopPropagation();
  }

  private getTransfer(event: any): any {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
  }

  ngOnDestroy() {}
}

export interface FileDropOptions {
  // if set to true drop target will be disabled and not accept any files dropped
  disabled?: boolean;
  // if set to true supports multiple files being dropped
  multiple?: boolean;
}
