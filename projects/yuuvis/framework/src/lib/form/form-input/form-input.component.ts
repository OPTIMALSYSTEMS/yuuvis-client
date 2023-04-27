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
  dateVariables: { value: string, key?: string, offset?: number, title?: string }[] = [
    { value: `${SearchFilter.VARIABLES.NOW}` },
    { value: `${SearchFilter.VARIABLES.TODAY},${SearchFilter.VARIABLES.TODAY}` },
    { value: `${SearchFilter.VARIABLES.YESTERDAY},${SearchFilter.VARIABLES.YESTERDAY}` },
    { value: `${SearchFilter.VARIABLES.THISWEEK},${SearchFilter.VARIABLES.THISWEEK}+6` },
    { value: `${SearchFilter.VARIABLES.THISMONTH},${SearchFilter.VARIABLES.THISMONTH}+${new Date(new Date().getFullYear(),new Date().getMonth() + 1,0).getDate() - 1}` },
    { value: `${SearchFilter.VARIABLES.THISYEAR},${SearchFilter.VARIABLES.THISYEAR}+${(new Date().getFullYear() % 4 === 0 ? 366 : 365) - 1}` }
  ];

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
      "icon": "<svg style=\"width:1.2em;height:1.2em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M17 18H21V16H17V14L14 17L17 20V18M11 4C8.8 4 7 5.8 7 8S8.8 12 11 12 15 10.2 15 8 13.2 4 11 4M11 6C12.1 6 13 6.9 13 8S12.1 10 11 10 9 9.1 9 8 9.9 6 11 6M11 13C8.3 13 3 14.3 3 17V20H12.5C12.2 19.4 12.1 18.8 12 18.1H4.9V17C4.9 16.4 8 14.9 11 14.9C11.5 14.9 12 15 12.5 15C12.8 14.4 13.1 13.8 13.6 13.3C12.6 13.1 11.7 13 11 13\" /></svg>",
      "isExecutable": "(component) => component.parent.formControlName && component.parent.childComponent.situation === 'SEARCH'",
      "run": "(component) => { component.parent.toggle(true, component.parent.variables['CURRENT_USER'] + '|eq'); }"
    },
    {
      "id": "yuv.framework.trigger.filter.variable.date",
      "label": "yuv.framework.trigger.filter.variable.date",
      "matchHook": "yuv-datetime-range",
      "group": "visible",
      "icon": "<svg style=\"width:1.2em;height:1.2em\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" d=\"M21 11.11V5C21 3.9 20.11 3 19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.11 3.9 21 5 21H11.11C12.37 22.24 14.09 23 16 23C19.87 23 23 19.87 23 16C23 14.09 22.24 12.37 21 11.11M12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3M5 19V5H7V7H17V5H19V9.68C18.09 9.25 17.08 9 16 9H7V11H11.1C10.5 11.57 10.04 12.25 9.68 13H7V15H9.08C9.03 15.33 9 15.66 9 16C9 17.08 9.25 18.09 9.68 19H5M16 21C13.24 21 11 18.76 11 16S13.24 11 16 11 21 13.24 21 16 18.76 21 16 21M16.5 16.25L19.36 17.94L18.61 19.16L15 17V12H16.5V16.25Z\" /></svg>",
      "isExecutable": "(component) => { var id = 'variableDate'; component.elRef.nativeElement.classList.add(id); api.util.styles('yuv-form-input:has(yuv-datetime + p-dropdown) .triggers.visible .' + id + ' { display: none!important; }', id); return component.parent.formControlName; }",
      "run": "(component) => { var vars = component.parent.dateVariables; var base = component.parent.parseVariable(component.parent.variable).base; var i = vars.findIndex(v => v.value === base); component.parent.toggle(true, vars[i + 1 < vars.length ? i + 1 : 0].value + '|' + (component.parent.childComponent.searchOption)); }"
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
    const v = this.parseVariable(variable);
    if (v.base === SearchFilter.VARIABLES.CURRENT_USER) return window['api'].session.user.get().title;
    const op = this.childComponent.searchOption = v.operator || SearchFilter.OPERATOR.EQUAL;
    const label = SearchFilter.OPERATOR_LABEL[Object.keys(SearchFilter.OPERATOR).find(k => SearchFilter.OPERATOR[k] === op)];
    const d = this.dateVariables.find(d => d.value === v.base) || v;
    const title = d.title || this.pluginsService.translate.instant(`yuv.framework.search.agg.time.${(d.key || v.key || '').toLowerCase()}`);
    const offset = d.offset ? ` ${d.offset > 0 ? '+' : '-'} ${Math.abs(d.offset)}` : '';
    return (label === SearchFilter.OPERATOR_LABEL.EQUAL ? '' : label) + title + offset;
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
