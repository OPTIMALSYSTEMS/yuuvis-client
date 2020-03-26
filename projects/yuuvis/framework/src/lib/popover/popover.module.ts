import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { PopoverComponent } from './popover/popover.component';

// based upon https://stackblitz.com/edit/cdk-popover-example-p1
@NgModule({
  declarations: [PopoverComponent],
  imports: [CommonModule, OverlayModule, PortalModule, YuvCommonUiModule],
  entryComponents: [PopoverComponent]
})
export class YuvPopoverModule {}
