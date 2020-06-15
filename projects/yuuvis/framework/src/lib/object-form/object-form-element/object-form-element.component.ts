import { Component, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { ObjectFormTranslateService } from '../object-form-translate.service';
import { ObjectFormControlWrapper } from '../object-form.interface';
import { Situation } from './../object-form.situation';

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

  @Input() situation: string;
  @Input() skipToggle: boolean;
  @Input() inlineError: boolean;

  // element is supposed to be a special FormGroup holding a single form element
  @Input('element')
  set elementSetter(el: ObjectFormControlWrapper) {
    if (el) {
      this.element = el;
      this.formElementRef = el.controls[el._eoFormControlWrapper.controlName];
      if (this.formElementRef._eoFormElement.isNotSetValue) {
        this.labelToggled(true);
      }
      this.fetchTags();
      this.formElementRef.valueChanges.pipe(takeUntilDestroy(this)).subscribe((_) => {
        this.setupErrors();
      });

      // this.setGrouping(this.formElementRef._eoFormElement);
    }
  }

  constructor(
    private translate: TranslateService,
    private formTranslateService: ObjectFormTranslateService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  // private setGrouping(formElement) {
  //   this.formElementRef = {
  //     ...this.formElementRef,
  //     _eoFormElement: {
  //       ...this.formElementRef._eoFormElement,
  //       grouping: formElement?.classification?.includes(Classification.NUMBER_DIGIT)
  //     }
  //   };
  // }

  labelToggled(toggled: boolean) {
    if (!this.skipToggle && this.situation === Situation.SEARCH) {
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
