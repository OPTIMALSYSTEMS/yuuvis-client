import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonModule } from '../common/common.module';
import { PopoverComponent } from './popover/popover.component';

// based upon https://stackblitz.com/edit/cdk-popover-example-p1
@NgModule({
  declarations: [PopoverComponent],
  imports: [CommonModule, OverlayModule, PortalModule, YuvCommonModule],
  entryComponents: [PopoverComponent]
})
export class YuvPopoverModule {}
