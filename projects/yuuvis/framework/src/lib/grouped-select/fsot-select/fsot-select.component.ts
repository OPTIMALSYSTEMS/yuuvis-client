import { FocusKeyManager } from '@angular/cdk/a11y';
import { AfterViewInit, Component, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { SecondaryObjectType } from '@yuuvis/core';
import { FSOTSelectable } from '../grouped-select/grouped-select.interface';
import { FsotSelectItemComponent } from './fsot-select-item/fsot-select-item.component';

/**
 * Picker for selecting a floating secondary object type.
 */
@Component({
  selector: 'yuv-fsot-select',
  templateUrl: './fsot-select.component.html',
  styleUrls: ['./fsot-select.component.scss']
})
export class FsotSelectComponent implements AfterViewInit {
  @ViewChildren(FsotSelectItemComponent) items: QueryList<FsotSelectItemComponent>;
  private keyManager: FocusKeyManager<FsotSelectItemComponent>;

  @Input() fsots: FSOTSelectable[];
  @Output() fsotSelect = new EventEmitter<SecondaryObjectType>();

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    this.keyManager.onKeydown(event);
  }

  @HostListener('keydown.Enter') onEnter() {
    this.select(this.keyManager.activeItem.item);
  }

  constructor() {}

  select(item: FSOTSelectable) {
    this.fsotSelect.emit(item.value);
  }

  ngAfterViewInit(): void {
    this.keyManager = new FocusKeyManager(this.items).skipPredicate((item) => item.disabled).withWrap();
  }
}
