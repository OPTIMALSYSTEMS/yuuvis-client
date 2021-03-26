import { FocusableOption } from '@angular/cdk/a11y';
import { Component, ElementRef, HostBinding, Input } from '@angular/core';
import { FloatingSotSelectItem } from '../../floating-sot-select.interface';

@Component({
  selector: 'yuv-floating-sot-select-item',
  templateUrl: './floating-sot-select-item.component.html',
  styleUrls: ['./floating-sot-select-item.component.scss']
})
export class FloatingSotSelectItemComponent implements FocusableOption {
  constructor(public element: ElementRef) {}

  @HostBinding('class.disabled') _disabled: boolean;

  _item: FloatingSotSelectItem;
  @Input() set item(i: FloatingSotSelectItem) {
    this._item = i;
    this._disabled = i.disabled;
  }

  focus(): void {
    this.element.nativeElement.focus();
  }
}
