import { FocusKeyManager } from '@angular/cdk/a11y';
import { Attribute, Component, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import {
  ContentStreamAllowed,
  DmsObject,
  PredictionClassifyResult,
  PredictionService,
  SecondaryObjectType,
  SystemService,
  TranslateService
} from '@yuuvis/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FloatingSotSelectInput, FloatingSotSelectItem } from '../floating-sot-select.interface';
import { FloatingSotSelectItemComponent } from './floating-sot-select-item/floating-sot-select-item.component';

@Component({
  selector: 'yuv-floating-sot-select',
  templateUrl: './floating-sot-select.component.html',
  styleUrls: ['./floating-sot-select.component.scss']
})
export class FloatingSotSelectComponent {
  @ViewChildren(FloatingSotSelectItemComponent) items: QueryList<FloatingSotSelectItemComponent>;
  private keyManager: FocusKeyManager<FloatingSotSelectItemComponent>;

  @Input() title: string;

  dmsObject: DmsObject;
  predictionClassifyResult: PredictionClassifyResult;
  sots: FloatingSotSelectItem[];

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    this.keyManager.onKeydown(event);
  }

  @HostListener('keydown.Enter') onEnter() {
    if (this.keyManager.activeItem) {
    }
  }

  @Input() set fsotSelectInput(i: FloatingSotSelectInput) {
    this.dmsObject = i.dmsObject;

    (this.dmsObject && this.dmsObject.content && this.predict && this.predictionService.supportsPrediction(this.dmsObject.objectTypeId)
      ? this.predictionService.classify(this.dmsObject.id)
      : of(null)
    )
      .pipe(
        // just catch error, if we could not get predictions its not that important
        // otherwise we would get a red toast which looks dangerous
        catchError((e) => of(null))
      )
      .subscribe((prdRes: PredictionClassifyResult) => {
        this.predictionClassifyResult = prdRes;
        this.sots = [...(Array.isArray(i.additionalItems) ? i.additionalItems : []), ...this.toSelectables(i.sots, prdRes)];
      });
  }

  // Emitted once a floating SOT has been selected
  // May be NULL in case the general object type has been selected
  @Output() fsotSelect = new EventEmitter<FloatingSotSelectItem>();

  constructor(
    @Attribute('predict') public predict: string,
    private predictionService: PredictionService,
    private translate: TranslateService,
    private systemService: SystemService
  ) {}

  private toSelectables(sots: SecondaryObjectType[], prdRes: PredictionClassifyResult): FloatingSotSelectItem[] {
    let res: FloatingSotSelectItem[] = [];

    if (prdRes) {
      sots.forEach((sot) => {
        if (prdRes.predictions[sot.id]) {
          prdRes.predictions[sot.id].forEach((p: { probability: number; data: any }) => {
            res.push(this.toSelectable(sot, p));
          });
        }
      });
    } else {
      res = sots.map((sot) => this.toSelectable(sot));
    }
    return res;
  }

  private toSelectable(
    sot: SecondaryObjectType,
    prediction?: {
      probability: number;
      data?: any;
    }
  ): FloatingSotSelectItem {
    // if we got files but the target FSOT does not support content
    const contentRequiredButMissing = !this.dmsObject?.content && sot.contentStreamAllowed === ContentStreamAllowed.REQUIRED;
    // if the target FSOT requires a file, but we don't have one
    const contentButNotAllowed = !!this.dmsObject?.content && sot.contentStreamAllowed === ContentStreamAllowed.NOT_ALLOWED;
    const disabled = contentRequiredButMissing || contentButNotAllowed;
    let selectable: FloatingSotSelectItem = {
      label: sot.label,
      svgSrc: this.systemService.getObjectTypeIconUri(sot.id),
      disabled: disabled,
      prediction: prediction?.probability,
      sot: sot,
      data: prediction?.data
    };
    //
    if (prediction?.data) {
      // TODO: find better approach than that
      const k = Object.keys(prediction.data)[0];
      selectable.description = `${this.systemService.getLocalizedResource(k + '_label')}: ${prediction.data[k]}`;
    }
    // add description to tell the user why a selectable is disabled
    if (disabled) {
      selectable.description = contentRequiredButMissing
        ? this.translate.instant('yuv.framework.object-create.afo.type.select.disabled.content-missing')
        : this.translate.instant('yuv.framework.object-create.afo.type.select.disabled.content-not-allowed');
    }
    return selectable;
  }

  select(item: FloatingSotSelectItem) {
    if (item && !item.disabled) {
      // send feedback to prediction service
      if (this.predictionClassifyResult) {
        this.predictionService.sendClassifyFeedback(this.predictionClassifyResult.id, item.sot.id);
      }
      this.fsotSelect.emit(item);
    }
  }

  ngAfterViewInit() {
    this.keyManager = new FocusKeyManager(this.items).skipPredicate((item) => item.disabled).withWrap();
  }
}
