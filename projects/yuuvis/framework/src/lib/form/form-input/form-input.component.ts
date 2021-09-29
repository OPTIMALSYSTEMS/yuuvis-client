import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { PluginsService } from '../../plugins/plugins.service';
import { ObjectFormComponent } from './../../object-form/object-form/object-form.component';
import { PluginTriggerComponent } from './../../plugins/plugin-trigger.component';

/**
 * Component for wrapping a form element. Provides a label and focus behaviour.
 *
 * @example
 * <yuv-form-input [label]="'my form element'">
 *   <!-- form element to be wrapped -->
 * </yuv-form-input>
 */
@Component({
  selector: 'yuv-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.scss'],
  host: { class: 'yuv-form-input' }
})
export class FormInputComponent implements AfterViewInit {
  @ViewChildren(PluginTriggerComponent) triggers: QueryList<PluginTriggerComponent>;

  @ViewChild('label', { static: true }) labelEl: ElementRef;
  @ContentChild(NG_VALUE_ACCESSOR) childComponent: any;

  toggled = false;
  _label: string;

  /**
   * A label string for the wrapped form element
   */
  @Input('label')
  set label(val: string) {
    this._label = val;
  }

  /**
   * A tag that can be applied to the input (including title that shows up once the user hovers the tag)
   */
  @Input() tag: { label: string; title: string };
  /**
   * Optional description for the form input
   */
  @Input() description: string;
  /**
   * Clicking the label will by default set a 'Not set' flag to the input. This is useful when you are for
   * example trying to indicate that a value is suposed to be not set instead of beeing just empty.
   */
  @HostBinding('class.skipToggle')
  @Input()
  skipToggle: boolean;

  @Input('isNull')
  set isNull(n: boolean) {
    this.toggled = n;
  }

  /**
   * Indicator that the wrapped form element is invalid. Will then render appropriate styles.
   * You may also provide an array of error messages.
   */
  @Input('invalid')
  set invalid(iv: boolean | string[]) {
    if (iv === null || iv === undefined) {
      this.isInvalid = false;
      this.renderer.removeAttribute(this.labelEl.nativeElement, 'title');
    } else if (Array.isArray(iv)) {
      this.isInvalid = iv.length > 0;
      if (this.isInvalid) {
        this.renderer.setAttribute(this.labelEl.nativeElement, 'title', iv.join(';'));
      }
    } else {
      this.isInvalid = iv;
    }
  }
  /**
   * Indicator that the wrapped form element is disabled. Will then render appropriate styles.
   */
  @Input('disabled')
  set disabled(d: boolean) {
    this.isDisabled = d;
  }

  /**
   * Indicator that the wrapped form element is mandatory. Will then render appropriate styles.
   */
  @Input('required')
  set required(d: boolean) {
    this.isRequired = d;
  }

  /**
   * Emits whether or not the input was set to 'Not set' state. Requires input `skipToggle` to be false.
   */
  @Output() onToggleLabel = new EventEmitter<boolean>();

  @HostBinding('class.disabled') isDisabled;
  @HostBinding('class.invalid') isInvalid;
  @HostBinding('class.required') isRequired;

  get childElement() {
    return this.elRef.nativeElement.querySelector('.control').firstElementChild;
  }

  get formControlName() {
    return this.childElement.getAttribute('data-name');
  }

  get hook() {
    return this.childElement?.localName;
  }

  visiblePlugins = [];
  hiddenPlugins = [];

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef,
    private pluginsService: PluginsService,
    @Inject(ObjectFormComponent) private objectForm: ObjectFormComponent
  ) {}

  toggle() {
    if (!this.skipToggle && !this.isDisabled) {
      this.toggled = !this.toggled;
      this.onToggleLabel.emit(this.toggled);
    }
  }

  getTrigger(id?: string) {
    return id ? this.triggers?.find((t) => t.action.id === id) : this.triggers?.first;
  }

  runTrigger(id?: string) {
    return this.getTrigger(id)?.run();
  }

  closeTrigger(result = false, id?: string) {
    return this.getTrigger(id)?.popover?.close(result);
  }

  ngAfterViewInit() {
    this.pluginsService.getCustomPlugins('triggers', this.hook).subscribe((t) => {
      this.visiblePlugins = t.filter((action: any) => action.group === 'visible');
      this.hiddenPlugins = t.filter((action: any) => action.group !== 'visible');
    });
  }
}
