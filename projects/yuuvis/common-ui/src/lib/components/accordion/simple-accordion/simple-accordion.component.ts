import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'yuv-simple-accordion',
  templateUrl: './simple-accordion.component.html',
  styleUrls: ['./simple-accordion.component.scss']
})
export class SimpleAccordionComponent {
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
