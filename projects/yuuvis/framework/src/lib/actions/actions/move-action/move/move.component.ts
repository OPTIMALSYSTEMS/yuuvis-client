import { Component, EventEmitter, OnInit } from '@angular/core';
import { DmsService, SystemType } from '@yuuvis/core';
import { ActionComponent } from './../../../interfaces/action-component.interface';

@Component({
  selector: 'yuv-move',
  templateUrl: './move.component.html',
  styleUrls: ['./move.component.scss']
})
export class MoveComponent implements OnInit, ActionComponent {
  selection: any[];
  finished: EventEmitter<any> = new EventEmitter();
  canceled: EventEmitter<any> = new EventEmitter();

  contextInfo: any;
  allowedTypes = [SystemType.FOLDER];

  constructor(private dmsService: DmsService) {}

  onPickerResult(contextInfos) {
    this.contextInfo = contextInfos;
  }

  move() {
    this.dmsService.moveDmsObjects(this.contextInfo.id, this.selection).subscribe();
    this.finished.emit();
  }

  cancel() {
    this.canceled.emit();
  }

  ngOnInit(): void {}
}
