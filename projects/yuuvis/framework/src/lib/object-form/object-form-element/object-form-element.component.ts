import { Component, DestroyRef, ElementRef, Input, OnDestroy, Renderer2, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Classification, TranslateService } from '@yuuvis/core';
import { ObjectFormTranslateService } from '../object-form-translate.service';
import { ObjectFormControlWrapper } from '../object-form.interface';
import { ObjectFormUtils } from '../object-form.utils';
import { Situation } from './../object-form.situation';

/**
 * Component rendering a single form element.
 *
 * @example
 *<yuv-object-form-element [element]="someForm.controls[key]" [situation]="situation"></yuv-object-form-element>
 */

@Component({
  selector: 'yuv-object-form-element',
  templateUrl: './object-form-element.component.html',
  styleUrls: ['./object-form-element.component.scss']
})
export class ObjectFormElementComponent implements OnDestroy {
  destroyRef = inject(DestroyRef);

  formElementRef: any;
  element: ObjectFormControlWrapper;
  errors: string[];
  isNull: boolean;
  isNot: boolean;
  tag: {
    label: string;
    title: string;
  };

  /**
   * Form situation, if not set default will be 'EDIT'
   */
  @Input() situation: string;

  /**
   * set a label toggle class to form
   */
  @Input() skipToggle: boolean;

  /**
   * Provide an error message if the required field was not filled.
   */
  @Input() inlineError: boolean;

  get shouldSkipToggle() {
    return (
      this.skipToggle ||
      this.situation !== 'SEARCH' ||
      this.formElementRef._eoFormElement.readonly ||
      (this.formElementRef._eoFormElement._internalType || '').match('boolean')
    );
  }

  @Input() set formElement(el: { element: any, situation?: string }) {
    this.elementSetter = el && ObjectFormUtils.elementToFormControl(el.element, el.situation);
  }

  /**
   *  Element is supposed to be a special FormGroup holding a single form element.
   */
  @Input('element')
  set elementSetter(el: ObjectFormControlWrapper) {
    if (el) {
      this.element = el;
      this.formElementRef = el.controls[el._eoFormControlWrapper.controlName];
      this.formElementRef._eoFormElement = this.setGrouping(this.formElementRef?._eoFormElement);
      if (this.formElementRef._eoFormElement.isNotSetValue) {
        this.labelToggled({ toggled: true, variable: this.formElementRef._eoFormElement.variable }, false);
      }
      if (this.formElementRef._eoFormElement.useNot) {
        this.useNot(true, false);
      }
      this.fetchTags();
      this.formElementRef?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((_) => this.setupErrors());
    }
  }

  constructor(
    private translate: TranslateService,
    private formTranslateService: ObjectFormTranslateService,
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  /**
   * formating rules...
   * https://wiki.optimal-systems.de/display/PM/Status+yuuvis+Momentum+-+Flex+client
   */
  private setGrouping(formElement) {
    return { ...formElement, grouping: !!formElement?.classifications?.includes(Classification.NUMBER_DIGIT) };
  }

  onDataMetaChange(data: any) {
    this.formElementRef._eoFormElement.dataMeta = data;
  }

  labelToggled({ toggled, variable }, readonly = this.formElementRef._eoFormElement.readonly) {
    if (!this.skipToggle && this.situation === Situation.SEARCH && !readonly) {
      this.isNull = toggled;
      this.formElementRef._eoFormElement.isNotSetValue = toggled;
      this.formElementRef._eoFormElement.variable = variable;
      this.element.updateValueAndValidity();
    }
  }

  useNot(useNot: boolean, readonly = this.formElementRef._eoFormElement.readonly) {
    if (!this.skipToggle && this.situation === Situation.SEARCH && !readonly) {
      this.isNot = useNot;
      this.formElementRef._eoFormElement.useNot = useNot;
      this.element.updateValueAndValidity();
    }
  }

  fetchTags() {
    this.tag = null;
    if (
      this.situation === Situation.CREATE &&
      (this.formElementRef._eoFormElement.hasOwnProperty('defaultvaluefunction') || this.formElementRef._eoFormElement.hasOwnProperty('defaultvalue'))
    ) {
      this.tag =
        this.formElementRef._eoFormElement.defaultvaluefunction === 'EXTRACTION'
          ? {
            label: 'ex',
            title: this.translate.instant('yuv.framework.object-form-element.tag.ex')
          }
          : {
            label: 'df',
            title: this.translate.instant('yuv.framework.object-form-element.tag.df')
          };
    }
  }

  private setupErrors() {
    this.errors = null;
    if (
      (this.situation !== Situation.SEARCH && this.situation !== Situation.CREATE && this.formElementRef.errors) ||
      ((this.situation === Situation.SEARCH || this.situation === Situation.CREATE) &&
        this.formElementRef.errors &&
        (this.formElementRef.dirty || this.formElementRef.touched))
    ) {
      this.errors = Object.keys(this.formElementRef.errors).map((key) => {
        return key === 'eoformScript'
          ? this.formElementRef._eoFormElement.error.msg
          : this.formTranslateService.getErrorLabel(key, this.formElementRef.errors[key].params);
      });
    }
  }

  ngOnDestroy() { }
}
