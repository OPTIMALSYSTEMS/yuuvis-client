import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopoverRef } from '../../../popover/popover.ref';
import { ProcessAttachment } from '../process-attachments.interface';

@Component({
  selector: 'yuv-process-attachments-order',
  templateUrl: './process-attachments-order.component.html',
  styleUrls: ['./process-attachments-order.component.scss']
})
export class ProcessAttachmentsOrderComponent implements OnInit {
  _attachments: ProcessAttachment[] = [];
  dirty: boolean = false;
  @Input() popoverRef: PopoverRef;
  @Input() set attachments(a: ProcessAttachment[]) {
    // deep copy
    this._attachments = a ? [...a] : [];
  }
  @Output() orderChange = new EventEmitter<string[]>();

  constructor() {}

  attachmentOrderDrop(event: CdkDragDrop<string[]>) {
    this.dirty = true;
    moveItemInArray(this._attachments, event.previousIndex, event.currentIndex);
  }

  emitOrderChange() {
    this.orderChange.emit(this._attachments.map((a) => a.id));
    this.cancel();
  }

  cancel() {
    if (this.popoverRef) {
      this.popoverRef.close();
    }
  }

  ngOnInit(): void {}
}
