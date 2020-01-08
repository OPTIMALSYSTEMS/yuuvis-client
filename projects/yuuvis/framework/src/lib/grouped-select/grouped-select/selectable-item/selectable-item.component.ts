import { FocusableOption } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Selectable, SelectableInternal } from './../grouped-select.interface';

@Component({
  selector: 'yuv-selectable-item',
  template: '<div [ngClass]="{selected: selected}"><yuv-checkbox tabindex="-1" [(ngModel)]="selected"></yuv-checkbox>{{item.label}}</div>',
  styleUrls: ['./selectable-item.component.scss']
})
export class SelectableItemComponent implements FocusableOption {
  _item: SelectableInternal;

  @HostListener('keydown.Space', ['$event']) onSpace(e) {
    e.preventDefault();
    this.toggleSelected();
  }

  @HostListener('click') onClick() {
    this.toggleSelected();
  }

  @Input() set item(item: Selectable) {
    this._item = item;
  }
  get item() {
    return this._item;
  }
  @Input() selected: boolean;

  @Output() select = new EventEmitter<boolean>();

  constructor(public element: ElementRef) {}

  private toggleSelected() {
    this.selected = !this.selected;
    this.select.emit(this.selected);
  }

  focus(): void {
    this.element.nativeElement.focus();
  }
}
