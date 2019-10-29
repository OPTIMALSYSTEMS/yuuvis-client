import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { DmsService } from '@yuuvis/core';
import { ActionComponent } from './../../../interfaces/action-component.interface';

@Component({
  selector: 'yuv-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, ActionComponent {
  selection: any[];
  finished: EventEmitter<any> = new EventEmitter();
  canceled: EventEmitter<any> = new EventEmitter();

  file: File;

  @ViewChild('fileInput', { static: false }) fileInput;

  constructor(private dmsService: DmsService) {}

  ngOnInit() {
    setTimeout(() => {
      this.openFileDialog();
    }, 0);
  }

  onChange() {
    this.file = this.fileInput.nativeElement.files[0];
    // this.fileInput.nativeElement.value = null;
  }

  openFileDialog() {
    this.fileInput.nativeElement.click();
  }

  save() {
    this.dmsService.uploadContent(this.selection[0].id, this.fileInput.nativeElement.files[0]).subscribe();
    this.finished.emit();
  }

  cancel() {
    this.canceled.emit();
  }
}
