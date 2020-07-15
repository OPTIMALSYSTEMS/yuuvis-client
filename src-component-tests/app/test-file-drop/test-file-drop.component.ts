import { Component } from '@angular/core';

@Component({
  selector: 'yuv-test-file-drop',
  templateUrl: './test-file-drop.component.html',
  styleUrls: ['./test-file-drop.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestFileDropComponent {
  drop: { files: File[]; target: string };

  targets = ['target#1', 'target#2', 'target#3', 'target#4', 'target#5', 'target#6', 'target#7'];

  constructor() {}

  onFilesDropped(files: File[], target: string) {
    this.drop = {
      files: Array.isArray(files) ? files : [files],
      target: target
    };
    console.log(this.drop);
  }
}
