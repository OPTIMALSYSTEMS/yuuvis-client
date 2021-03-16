import { FocusableOption } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FSOTSelectable } from '../../grouped-select/grouped-select.interface';

@Component({
  selector: 'yuv-fsot-select-item',
  templateUrl: './fsot-select-item.component.html',
  styleUrls: ['./fsot-select-item.component.scss']
})
export class FsotSelectItemComponent implements FocusableOption {
  @Input() item: FSOTSelectable;
  @Output() select = new EventEmitter<FSOTSelectable>();

  @HostListener('click') onClick() {
    this.emitSelect();
  }

  constructor(public element: ElementRef) {}

  emitSelect() {
    this.select.emit(this.item);
  }

  focus(): void {
    this.element.nativeElement.focus();
  }
}
