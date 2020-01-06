import { FocusKeyManager } from '@angular/cdk/a11y';
import { AfterContentInit, Component, ContentChildren, ElementRef, HostListener, Input, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { SelectableGroup } from '../grouped-select.interface';
import { SelectableItemComponent } from '../selectable-item/selectable-item.component';

@Component({
  selector: 'yuv-selectable-group',
  templateUrl: './selectable-group.component.html',
  styleUrls: ['./selectable-group.component.scss']
})
export class SelectableGroupComponent implements AfterContentInit {
  private keyManager: FocusKeyManager<SelectableItemComponent>;

  @ContentChildren(SelectableItemComponent) items: QueryList<SelectableItemComponent>;
  @ViewChildren('groupList') groupList: ElementRef;

  @Input() group: SelectableGroup;

  @HostListener('keydown', ['$event'])
  manage(event) {
    this.keyManager.onKeydown(event);
  }

  // provides the focus on the first item inside a group (with a magical help from cdk FocusKeyManager), does the group an active
  @HostListener('focus', ['$event'])
  _focus(event) {
    this.renderer.addClass(this.element.nativeElement, 'active');
  }

  // when the group leaves her focus, an active class is removed
  @HostListener('blur', ['$event'])
  _blur(event) {
    this.renderer.removeClass(this.element.nativeElement, 'active');
  }

  constructor(private element: ElementRef, private renderer: Renderer2) {}

  ngAfterContentInit() {
    this.keyManager = new FocusKeyManager(this.items).withWrap();
  }
}
