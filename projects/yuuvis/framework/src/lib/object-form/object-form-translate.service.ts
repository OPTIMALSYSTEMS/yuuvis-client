import { Injectable } from '@angular/core';
import { TranslateService } from '@yuuvis/core';

@Injectable({
  providedIn: 'root'
})
export class ObjectFormTranslateService {
  private errorLabels;

  constructor(private translate: TranslateService) {
    this.translate.onLangChange.subscribe(_ => {
      this.setupLabels();
    });
    this.setupLabels();
  }

  private setupLabels() {
    this.errorLabels = {
      daterange: this.translate.instant('yuv.framework.object-form-element.error.daterange.invalid'),
      daterangeorder: this.translate.instant('yuv.framework.object-form-element.error.daterangeorder.invalid'),
      numberrange: this.translate.instant('yuv.framework.object-form-element.error.numberrange.invalid'),
      numberrangeorder: this.translate.instant('yuv.framework.object-form-element.error.numberrangeorder.invalid'),
      number: this.translate.instant('yuv.framework.object-form-element.error.number'),
      precision: this.translate.instant('yuv.framework.object-form-element.error.number.precision'),
      scale: this.translate.instant('yuv.framework.object-form-element.error.number.scale'),
      regex: this.translate.instant('yuv.framework.object-form-element.error.string.regex.nomatch'),
      pattern: this.translate.instant('yuv.framework.object-form-element.error.string.regex.nomatch'),
      classificationemail: this.translate.instant('yuv.framework.object-form-element.error.string.classification.email'),
      classificationurl: this.translate.instant('yuv.framework.object-form-element.error.string.classification.url'),
      onlyWhitespaces: this.translate.instant('yuv.framework.object-form-element.error.string.whitespaces'),
      datecontrol: this.translate.instant('yuv.framework.object-form-element.error.date.invalid'),
      required: this.translate.instant('yuv.framework.object-form-element.error.required'),
      maxlength: this.translate.instant('yuv.framework.object-form-element.error.maxlength'),
      minlength: this.translate.instant('yuv.framework.object-form-element.error.minlength'),
      minmax: this.translate.instant('yuv.framework.object-form-element.error.minmax')
    };
  }

  getErrorLabel(error) {
    return this.errorLabels[error];
  }
}
