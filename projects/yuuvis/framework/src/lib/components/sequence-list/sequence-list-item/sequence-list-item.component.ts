import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SequenceListChangeMode, SequenceListChangeOutput } from '../sequence-list.interface';

@Component({
  selector: 'yuv-sequence-list-item',
  templateUrl: './sequence-list-item.component.html',
  styleUrls: ['./sequence-list-item.component.scss']
})
export class SequenceListItemComponent {
  changeMode = SequenceListChangeMode;
  @Input() index: number;
  @Input() addTargetIndex: number = null;
  @Output() changeEntry: EventEmitter<SequenceListChangeOutput> = new EventEmitter<SequenceListChangeOutput>();
  @Output() edit: EventEmitter<number> = new EventEmitter<number>();
  @Output() delete: EventEmitter<number> = new EventEmitter<number>();
  @Output() insert: EventEmitter<number> = new EventEmitter<number>();

  constructor() {}

  changes(index: number, mode: SequenceListChangeMode) {
    this.changeEntry.emit({ index, mode });
    if (SequenceListChangeMode.EDIT === mode) this.edit.emit(index);
    if (SequenceListChangeMode.DELETE === mode) this.delete.emit(index);
    if (SequenceListChangeMode.INSERT === mode) this.insert.emit(index);
  }
}
