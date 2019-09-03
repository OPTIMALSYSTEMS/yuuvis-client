import { Component, ElementRef, Input, Renderer2 } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { ObjectFormControlWrapper } from '../object-form.interface';

@Component({
  selector: 'yuv-object-form-element',
  templateUrl: './object-form-element.component.html',
  styleUrls: ['./object-form-element.component.scss']
})
export class ObjectFormElementComponent {
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
    }
  }

  constructor(private translate: TranslateService, private renderer: Renderer2, private el: ElementRef) {
    // setup error messages for the different types of errors that may appear
  }

  labelToggled(toggled: boolean) {
    if (!this.skipToggle && this.element._eoFormControlWrapper.situation === 'SEARCH') {
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
      this.situation === 'CREATE' &&
      (this.formElementRef._eoFormElement.hasOwnProperty('defaultvaluefunction') || this.formElementRef._eoFormElement.hasOwnProperty('defaultvalue'))
    ) {
      this.tag =
        this.formElementRef._eoFormElement.defaultvaluefunction === 'EXTRACTION'
          ? {
              label: 'ex',
              title: this.translate.instant('eo.form.element.tag.ex')
            }
          : {
              label: 'df',
              title: this.translate.instant('eo.form.element.tag.df')
            };
    }
  }
}
