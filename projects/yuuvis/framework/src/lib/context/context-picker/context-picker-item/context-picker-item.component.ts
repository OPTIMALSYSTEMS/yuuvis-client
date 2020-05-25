import { Highlightable } from '@angular/cdk/a11y';
import { Component, ElementRef, HostBinding, Input } from '@angular/core';

export interface ContextFilterItem {
  id: string;
  iconSVG: string;
  title: string;
  description: string;
}

@Component({
  selector: 'yuv-context-picker-item',
  templateUrl: './context-picker-item.component.html',
  styleUrls: ['./context-picker-item.component.scss']
})
export class ContextPickerItemComponent implements Highlightable {
  @HostBinding('class.active') _active: boolean = false;

  @Input() item: ContextFilterItem;

  constructor(public element: ElementRef) {}

  setActiveStyles(): void {
    this._active = true;
  }
  setInactiveStyles(): void {
    this._active = false;
  }
}
