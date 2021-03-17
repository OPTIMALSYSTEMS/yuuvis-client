import { FocusKeyManager } from '@angular/cdk/a11y';
import { Attribute, Component, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { ContentStreamAllowed, DmsObject, PredictionService, SecondaryObjectType, SystemService, TranslateService } from '@yuuvis/core';
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
  title: string;

  dmsObject: DmsObject;
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
    this.sots = [...(Array.isArray(i.additionalItems) ? i.additionalItems : []), ...i.sots.map((sot) => this.toSelectable(sot))];
    this.title = i.isPrimary
      ? this.translate.instant('yuv.framework.object-form-edit.fsot.apply-type')
      : this.translate.instant('yuv.framework.object-form-edit.fsot.add-fsot.dialog.title');
  }

  // Emitted once a floating SOT has been selected
  // May be NULL in case the general object type has been selected
  @Output() fsotSelect = new EventEmitter<SecondaryObjectType>();

  constructor(
    @Attribute('predict') predict: string,
    private predictionService: PredictionService,
    private translate: TranslateService,
    private systemService: SystemService
  ) {
    if (predict) {
    }
  }

  private toSelectable(sot: SecondaryObjectType): FloatingSotSelectItem {
    // if we got files but the target FSOT does not support content
    const contentRequiredButMissing = !this.dmsObject?.content && sot.contentStreamAllowed === ContentStreamAllowed.REQUIRED;
    // if the target FSOT requires a file, but we don't have one
    const contentButNotAllowed = !!this.dmsObject?.content && sot.contentStreamAllowed === ContentStreamAllowed.NOT_ALLOWED;
    const disabled = contentRequiredButMissing || contentButNotAllowed;
    let selectable: FloatingSotSelectItem = {
      label: sot.label,
      svgSrc: this.systemService.getObjectTypeIconUri(sot.id),
      disabled: disabled,
      sot: sot
    };
    // add description to tell the user why a selectable is disabled
    if (disabled) {
      selectable.description = contentRequiredButMissing
        ? this.translate.instant('yuv.framework.object-create.afo.type.select.disabled.content-missing')
        : this.translate.instant('yuv.framework.object-create.afo.type.select.disabled.content-not-allowed');
    }
    return selectable;
  }

  select(item: FloatingSotSelectItem) {
    if (!item.disabled) {
      this.fsotSelect.emit(item.sot);
    }
  }

  ngAfterViewInit() {
    this.keyManager = new FocusKeyManager(this.items).skipPredicate((item) => item.disabled).withWrap();
  }
}
