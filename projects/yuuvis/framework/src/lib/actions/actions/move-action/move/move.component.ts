import { Component, EventEmitter, OnInit } from '@angular/core';
import { DmsService, SystemType } from '@yuuvis/core';
import { ReferenceEntry } from '../../../../form/elements/reference/reference.interface';
import { ActionComponent } from './../../../interfaces/action-component.interface';

/**
 * @ignore
 */
@Component({
  selector: 'yuv-move',
  templateUrl: './move.component.html',
  styleUrls: ['./move.component.scss']
})
export class MoveComponent implements OnInit, ActionComponent {
  selection: any[];
  finished: EventEmitter<any> = new EventEmitter();
  canceled: EventEmitter<any> = new EventEmitter();

  contextInfo: ReferenceEntry;
  allowedTypes = [SystemType.FOLDER];

  constructor(private dmsService: DmsService) {}

  onPickerResult(contextInfos: ReferenceEntry) {
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
