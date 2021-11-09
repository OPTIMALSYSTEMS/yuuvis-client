import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { PopoverConfig } from '../../../popover/popover.interface';
import { PopoverService } from '../../../popover/popover.service';

@Component({
  selector: 'yuv-form-element-description',
  templateUrl: './form-element-description.component.html',
  styleUrls: ['./form-element-description.component.scss']
})
export class FormElementDescriptionComponent {
  @ViewChild('tplTooltip') tplTooltip: TemplateRef<any>;

  private MAX_CHARS = 100;

  descriptionStub: string;
  _description: string;
  @Input() set description(d: string) {
    this.descriptionStub = null;
    this._description = d;
    if (d?.length > this.MAX_CHARS) {
      this.descriptionStub = `${this._description.substring(0, this.MAX_CHARS)}`;
    }
  }

  constructor(private elRef: ElementRef, private popoverService: PopoverService) {}

  openTooltip() {
    const popoverConfig: PopoverConfig = {
      maxWidth: 300
    };
    this.popoverService.open(this.tplTooltip, popoverConfig, this.elRef);
  }
}
