import { Component, EventEmitter, HostListener, Input, OnDestroy, Output, Renderer2, ViewChild } from '@angular/core';
import { UnsubscribeOnDestroy } from '@yuuvis/common-ui';
import { EventService, PendingChangesService, Utils, YuvEventType } from '@yuuvis/core';
import { Dialog } from 'primeng/dialog';
import { filter, takeUntil } from 'rxjs/operators';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent extends UnsubscribeOnDestroy implements OnDestroy {
  icClose = SVGIcons.clear;

  private _visible = false;
  private _lastFocused;
  private active: boolean;
  private id = Utils.uuid();
  private parentId = '';
  @Input() title: string;
  @Input() subtitle: string;
  @Input() styleClass = '';

  // array of pendingTask IDs to be checked before the dialog closes
  @Input() dirtyCheck: string | string[] = [];

  @Input() appendTo = 'body';
  @Input() minWidth = 200;
  @Input() minHeight = 'auto';
  @Input() resizable = false;
  @Output() visibleChange: EventEmitter<any> = new EventEmitter();
  @Output() hide: EventEmitter<any> = new EventEmitter();
  @Output() show: EventEmitter<any> = new EventEmitter();

  @ViewChild(Dialog, { static: false }) dialog: Dialog;

  @Input()
  get visible(): boolean {
    return this._visible;
  }

  set visible(val) {
    this._visible = !!val;
    this.visibleChange.emit(this._visible);
    this._visible ? this.show.emit(val) : this.hide.emit(val);
    this.toggleActive(this._visible);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    // close active dialog on Escape event
    if (this.active) {
      this.closeDialog();
    }
  }

  @HostListener('document:mousedown', ['$event.target'])
  onMousedown(targetElement: HTMLElement) {
    // close active dialog on background/mask click
    if (this.active && targetElement.classList.contains('ui-dialog-mask')) {
      this.closeDialog();
    }
  }

  constructor(private eventService: EventService, private pendingChanges: PendingChangesService, private renderer: Renderer2) {
    super();
    this._lastFocused = document.activeElement;
    this.eventService
      .on(YuvEventType.DIALOG_STACK_CHANGED)
      .pipe(
        takeUntil(this.componentDestroyed$),
        filter((evt: any) => (this.active || evt.data.id === this.parentId) && evt.data.id !== this.id)
      )
      .subscribe((event: any) => {
        this.toggleActive(!event.data.active, !event.data.active);
        this.parentId = event.data.active ? event.data.id : '';
      });
  }

  toggleActive(active: boolean, trigger = true) {
    this.active = !!active;
    if (trigger) {
      this.eventService.trigger(YuvEventType.DIALOG_STACK_CHANGED, {
        id: this.id,
        active: this.active
      });
    }
    if (this.dialog) {
      this.renderer[this.active || !this.appendTo ? 'addClass' : 'removeClass'](this.dialog.contentViewChild.nativeElement, 'active');
      if (this.active) {
        if (this.minHeight !== 'auto') {
          setTimeout(() => {
            this.minHeight = 'auto';
            if (!!this.dialog) {
              this.renderer.setStyle(this.dialog.contentViewChild.nativeElement.parentElement, 'minHeight', 'auto');
              this.renderer.setStyle(this.dialog.contentViewChild.nativeElement.parentElement, 'maxWidth', '50%');
            }
          }, 200);
        }
        this.dialog.moveOnTop();
        let focusableElement = this.dialog.contentViewChild.nativeElement.querySelector('[tabindex]');
        if (focusableElement) {
          focusableElement.focus();
        }
      } else {
        this._lastFocused.focus();
      }
    } else if (this.active && this.visible) {
      setTimeout(() => this.toggleActive(true, false), 0);
    }
  }

  closeDialog() {
    if (this.dirtyCheck) {
      if (!this.pendingChanges.checkForPendingTasks(this.dirtyCheck)) {
        this.visible = false;
      }
    } else {
      this.visible = false;
    }
  }

  ngOnDestroy() {
    if (this.active) {
      this.toggleActive(false);
    }
  }
}
