import { PlatformLocation } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, Output, Renderer2, ViewChild } from '@angular/core';
import { EventService, PendingChangesService, Utils, YuvEventType } from '@yuuvis/core';
import { Dialog } from 'primeng/dialog';
import { filter } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnDestroy {
  icClose = SVGIcons.clear;

  private _visible = false;
  private _lastFocused;
  private active: boolean;
  private id = Utils.uuid();
  private parentId = '';
  contentStyle: any = { 'max-height': '100%' };
  @Input() title: string;
  @Input() subtitle: string;
  @Input() styleClass = '';

  // array of pendingTask IDs to be checked before the dialog closes
  @Input() dirtyCheck: string | string[] = [];

  @Input() appendTo = 'body';
  @Input() set minWidth(w: number | string) {
    this.contentStyle['min-width'] = typeof w === 'string' ? w : (w || 200) + 'px';
  }
  @Input() set minHeight(h: number | string) {
    this.contentStyle['min-height'] = typeof h === 'string' ? h : (h || 0) + 'px';
  }
  @Input() resizable = false;
  @Output() visibleChange: EventEmitter<any> = new EventEmitter();
  @Output() hide: EventEmitter<any> = new EventEmitter();
  @Output() show: EventEmitter<any> = new EventEmitter();

  @ViewChild(Dialog, { static: false }) dialog: Dialog;

  @Input()
  get visible(): boolean {
    return this._visible;
  }

  set visible(val: boolean) {
    this.setVisibility(val);
  }

  @HostListener('window:popstate') handlePopState() {
    if (this._visible) {
      this.setVisibility(false);
    }
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

  constructor(
    private eventService: EventService,
    private location: PlatformLocation,
    private pendingChanges: PendingChangesService,
    private renderer: Renderer2
  ) {
    this._lastFocused = document.activeElement;
    this.eventService
      .on(YuvEventType.DIALOG_STACK_CHANGED)
      .pipe(
        takeUntilDestroy(this),
        filter((evt: any) => (this.active || evt.data.id === this.parentId) && evt.data.id !== this.id)
      )
      .subscribe((event: any) => {
        this.toggleActive(!event.data.active, !event.data.active);
        this.parentId = event.data.active ? event.data.id : '';
      });
  }

  private setVisibility(val: boolean) {
    if (!this._visible && val) {
      this.location.pushState({}, 'dialog', `${this.location.pathname}#dialog`);
    }
    this._visible = !!val;
    this.visibleChange.emit(this._visible);
    this._visible ? this.show.emit(val) : this.hide.emit(val);
    this.toggleActive(this._visible);
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
        this.dialog.moveOnTop();
        const focusableElement = this.dialog.contentViewChild.nativeElement.querySelector('[tabindex]');
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
        // this.visible = false;
        this.location.back();
      }
    } else {
      // this.visible = false;
      this.location.back();
    }
  }

  ngOnDestroy() {
    if (this.active) {
      this.toggleActive(false);
    }
  }
}
