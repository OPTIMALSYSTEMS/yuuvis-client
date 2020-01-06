import { FocusableOption } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Selectable } from './../grouped-select.interface';

@Component({
  selector: 'yuv-selectable-item',
  template: '<div [ngClass]="{selected: _selected}"><yuv-checkbox [(ngModel)]="_selected"></yuv-checkbox>{{item.label}}</div>',
  styleUrls: ['./selectable-item.component.scss']
})
export class SelectableItemComponent implements FocusableOption {
  _selected: boolean;

  @HostListener('keydown.Space') onSpace() {
    this.toggleSelected();
  }

  @HostListener('click') onClick() {
    this.toggleSelected();
  }

  @Input() item: Selectable;
  @Output() selected = new EventEmitter<boolean>();

  constructor(public element: ElementRef) {}

  private toggleSelected() {
    this._selected = !this._selected;
    this.selected.emit(this._selected);
  }

  focus(): void {
    this.element.nativeElement.focus();
  }
}
