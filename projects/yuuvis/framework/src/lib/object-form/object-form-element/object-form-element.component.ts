import { Component, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';
import { Classification, TranslateService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { ObjectFormTranslateService } from '../object-form-translate.service';
import { ObjectFormControlWrapper } from '../object-form.interface';
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
  formElementRef: any;
  element: ObjectFormControlWrapper;
  errors: string[];
  isNull: boolean;
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
    return this.skipToggle || this.situation !== 'SEARCH' || this.formElementRef._eoFormElement.readonly;
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
        this.labelToggled(true, false);
      }
      this.fetchTags();
      this.formElementRef?.valueChanges.pipe(takeUntilDestroy(this)).subscribe((_) => this.setupErrors());
    }
  }

  constructor(
    private translate: TranslateService,
    private formTranslateService: ObjectFormTranslateService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  /**
   * formating rules...
   * https://wiki.optimal-systems.de/display/PM/Status+yuuvis+Momentum+-+Flex+client
   */
  private setGrouping(formElement) {
    return { ...formElement, grouping: !!formElement?.classifications?.includes(Classification.NUMBER_DIGIT) };
  }

  labelToggled(toggled: boolean, readonly = this.formElementRef._eoFormElement.readonly) {
    if (!this.skipToggle && this.situation === Situation.SEARCH && !readonly) {
      const toggleClass = 'label-toggled';
      this.isNull = toggled;
      if (toggled) {
        this.renderer.addClass(this.el.nativeElement, toggleClass);
      } else {
        this.renderer.removeClass(this.el.nativeElement, toggleClass);
      }
      this.formElementRef._eoFormElement.isNotSetValue = toggled;
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

  ngOnDestroy() {}
}
