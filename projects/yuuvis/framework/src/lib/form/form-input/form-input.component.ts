import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SearchFilter, TranslateService } from '@yuuvis/core';
import { PluginsService } from '../../plugins/plugins.service';
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

  @Input() variable: any;

  variables = SearchFilter.VARIABLES;

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
  @Output() onToggleLabel = new EventEmitter<{toggled: boolean, variable: any}>();

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
  variablePlugins = [
    {
      "id": "yuv.framework.trigger.filter.variable.user",
      "label": "yuv.framework.trigger.filter.variable.user",
      "matchHook": "yuv-organization",
      "group": "visible",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path opacity=\".3\" d=\"M17 7H7V4H5v16h14V4h-2z\" fill=\"white\"/><path d=\"M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm7 18H5V4h2v3h10V4h2v16z\" fill=\"#626262\"/></svg>",
      "isExecutable": "(component) => component.parent.formControlName",
      "run": "(component) => { component.parent.toggle(true, component.parent.variables['CURRENT_USER']); }"
    },
    {
      "id": "yuv.framework.trigger.filter.variable.date",
      "label": "yuv.framework.trigger.filter.variable.date",
      "matchHook": "yuv-datetime",
      "group": "visible",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" focusable=\"false\" width=\"1em\" height=\"1em\" preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 24 24\"><path opacity=\".3\" d=\"M17 7H7V4H5v16h14V4h-2z\" fill=\"white\"/><path d=\"M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1zm7 18H5V4h2v3h10V4h2v16z\" fill=\"#626262\"/></svg>",
      "isExecutable": "(component) => component.parent.formControlName && component.parent.childComponent.searchOption !== 'gtelte'",
      "run": "(component) => { var values = Object.keys(component.parent.variables).filter(c => !c.match('CURRENT_USER')); var map = {}; values.forEach((v, i) => { map[v]= values[i+1]; }); map[values[values.length - 1]] = values[0]; component.parent.toggle(true, component.parent.variables[map[component.parent.parseVariable(component.parent.variable).key || values[values.length - 1]]] + '|' + (component.parent.childComponent.searchOption)); }"
    }
  ];

  constructor(private renderer: Renderer2, private elRef: ElementRef, private pluginsService: PluginsService, private translate: TranslateService) {
    this.translate.instant('yuv.framework.trigger.filter.variable.user');
    this.translate.instant('yuv.framework.trigger.filter.variable.date');
  }

  parseVariable(variable: string) {
    return SearchFilter.parseVariable(variable) || {} as any;
  }

  variableTitle(variable: string) {
    const op = this.childComponent.searchOption = this.parseVariable(variable).operator || SearchFilter.OPERATOR.EQUAL;
    const labels = { [SearchFilter.OPERATOR.GREATER_OR_EQUAL] : SearchFilter.OPERATOR_LABEL.GREATER_OR_EQUAL, [SearchFilter.OPERATOR.LESS_OR_EQUAL] : SearchFilter.OPERATOR_LABEL.LESS_OR_EQUAL };
    return variable === SearchFilter.VARIABLES.CURRENT_USER ? window['api'].session.user.get().title : 
        (labels[op] || '') + this.pluginsService.translate.instant(`yuv.framework.search.agg.time.${this.parseVariable(variable).key?.toLowerCase()}`);
  }

  toggle(toggle = !this.toggled, variable = null) {
    if (!this.skipToggle && !this.isDisabled) {
      this.toggled = toggle;
      this.variable = variable;
      this.onToggleLabel.emit({ toggled: this.toggled, variable });
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
      const variable = this.variablePlugins.find(v => this.hook.match(v.matchHook));
      if (variable && !this.visiblePlugins.find(v => v.id === variable.id))
        this.visiblePlugins = [variable, ...this.visiblePlugins];
    });
  }
}
