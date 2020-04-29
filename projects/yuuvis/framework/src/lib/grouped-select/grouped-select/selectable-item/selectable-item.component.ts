import { FocusableOption } from '@angular/cdk/a11y';
import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { Selectable, SelectableInternal } from './../grouped-select.interface';

/**
 * @ignore
 */
@Component({
  selector: 'yuv-selectable-item',
  templateUrl: './selectable-item.component.html',
  styleUrls: ['./selectable-item.component.scss']
})
export class SelectableItemComponent implements FocusableOption {
  _item: SelectableInternal;

  @HostListener('keydown.Space', ['$event']) onSpace(e) {
    e.preventDefault();
    this.toggleSelected(!this.selected);
  }

  @HostBinding('class.highlight') _highlight: boolean;
  @HostBinding('class.disabled') disabled: boolean;

  @Input() set item(item: Selectable) {
    this._item = item;
    this._highlight = item.highlight;
    this.disabled = item.disabled;
  }
  get item() {
    return this._item;
  }
  /**
   * Whether or not the item is selected
   */
  @Input() selected: boolean;

  /**
   * Emitted when the items selected state changed. Emits the new state.
   */
  @Output() toggle = new EventEmitter<boolean>();
  /**
   *
   */
  @Output() select = new EventEmitter<Selectable>();

  constructor(public element: ElementRef) {}

  /**
   * Called by clicking the checkbox
   */
  toggleSelected(e) {
    this.selected = e;
    this.toggle.emit(this.selected);
  }

  /**
   * Called by clicking the label.
   */
  emitSelect() {
    this.select.emit(this.item);
  }

  focus(): void {
    this.element.nativeElement.focus();
  }
}
