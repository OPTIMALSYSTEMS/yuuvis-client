import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { DmsService, SystemType } from '@yuuvis/core';
import { ReferenceEntry } from '../../../../form/elements/reference/reference.interface';
import { ROUTES, YuvRoutes } from '../../../../Routing/Routes';
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
  path: string;

  constructor(private dmsService: DmsService, @Inject(ROUTES) private routes: YuvRoutes) {
    this.path = this.routes && this.routes.object ? this.routes.object.path : null;
  }

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
