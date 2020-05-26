import { Component, EventEmitter, OnInit } from '@angular/core';
import { DmsObject, DmsService } from '@yuuvis/core';
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

  context: DmsObject;

  constructor(private dmsService: DmsService) {}

  onPickerResult(contextId) {
    this.dmsService.getDmsObject(contextId).subscribe((dmsObject) => (this.context = dmsObject));
  }

  move() {
    this.dmsService
      .moveDmsObjectsToFolder(
        this.context.id,
        this.selection.map((o) => o.id)
      )
      .subscribe(() => this.finished.emit());
  }

  cancel() {
    this.canceled.emit();
  }

  ngOnInit(): void {}
}
