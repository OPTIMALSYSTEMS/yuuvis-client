import { FocusableOption, Highlightable } from '@angular/cdk/a11y';
import { Component, ElementRef, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'yuv-value-picker-item',
  templateUrl: './value-picker-item.component.html',
  styleUrls: ['./value-picker-item.component.scss'],
  host: {
    tabindex: '-1'
  }
})
export class ValuePickerItemComponent implements Highlightable, FocusableOption {
  @Input() item;
  @Input() disabled = false;

  private _isActive = false;

  @HostBinding('class.active') get isActive() {
    return this._isActive;
  }

  constructor(private host: ElementRef) {}

  setActiveStyles() {
    this._isActive = true;
  }

  setInactiveStyles() {
    this._isActive = false;
  }

  getLabel() {
    return this.item.name;
  }

  focus() {
    this.host.nativeElement.focus();
  }
}
