import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'yuv-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent {
  _selected: boolean;
  @Input() header: string;
  @Input() styles: string;

  @Input()
  set selected(val) {
    this._selected = val;
  }

  get selected() {
    return this._selected;
  }

  @Output() onOpen: EventEmitter<any> = new EventEmitter();
  index: number = null;
  lastIndex = -1;

  onTabOpen(e) {
    const index = e.index;
    this.selected = true;
    this.onOpen.emit(this.selected);
  }

  onTabClose(e = false) {
    this.index = this.lastIndex--;
    this.selected = false;
    this.onOpen.emit(this.selected);
  }
}
