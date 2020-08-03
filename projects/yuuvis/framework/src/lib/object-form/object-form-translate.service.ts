import { Injectable } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
/**
 * Providing an error message when a translation string for an object wasn't found
 */
@Injectable({
  providedIn: 'root'
})
export class ObjectFormTranslateService {
  /**
   *
   * @ignore
   */
  constructor(private translate: TranslateService) {}

  /**
   * Set the error label if a translation for this string wasn't provided
   * @param error - error message about a missed translation key
   * @param params
   */
  getErrorLabel(error: string, params?: any) {
    switch (error) {
      case 'daterange':
        return this.translate.instant('yuv.framework.object-form-element.error.daterange.invalid', params);
      case 'daterangeorder':
        return this.translate.instant('yuv.framework.object-form-element.error.daterangeorder.invalid', params);
      case 'numberrange':
        return this.translate.instant('yuv.framework.object-form-element.error.numberrange.invalid', params);
      case 'numberrangeorder':
        return this.translate.instant('yuv.framework.object-form-element.error.numberrangeorder.invalid', params);
      case 'number':
        return this.translate.instant('yuv.framework.object-form-element.error.number', params);
      case 'precision':
        return this.translate.instant('yuv.framework.object-form-element.error.number.precision', params);
      case 'scale':
        return this.translate.instant('yuv.framework.object-form-element.error.number.scale', params);
      case 'regex':
        return this.translate.instant('yuv.framework.object-form-element.error.string.regex.nomatch', params);
      case 'pattern':
        return this.translate.instant('yuv.framework.object-form-element.error.string.regex.nomatch', params);
      case 'classificationemail':
        return this.translate.instant('yuv.framework.object-form-element.error.string.classification.email', params);
      case 'classificationphone':
        return this.translate.instant('yuv.framework.object-form-element.error.string.classification.phone', params);
      case 'classificationurl':
        return this.translate.instant('yuv.framework.object-form-element.error.string.classification.url', params);
      case 'onlyWhitespaces':
        return this.translate.instant('yuv.framework.object-form-element.error.string.whitespaces', params);
      case 'datecontrol':
        return this.translate.instant('yuv.framework.object-form-element.error.date.invalid', params);
      case 'required':
        return this.translate.instant('yuv.framework.object-form-element.error.required', params);
      case 'maxlength':
        return this.translate.instant('yuv.framework.object-form-element.error.maxlength', params);
      case 'minlength':
        return this.translate.instant('yuv.framework.object-form-element.error.minlength', params);
      case 'minmax':
        return this.translate.instant('yuv.framework.object-form-element.error.minmax', params);
      case 'minvalue':
        return this.translate.instant('yuv.framework.object-form-element.error.minvalue', params);
      case 'maxvalue':
        return this.translate.instant('yuv.framework.object-form-element.error.maxvalue', params);
      default:
        return this.translate.instant(error, params);
    }
  }
}
