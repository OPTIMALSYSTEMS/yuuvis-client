import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentRegister } from '../shared/utils/utils';
import { ConfirmComponent } from './confirm/confirm.component';
import { PopoverComponent } from './popover/popover.component';

const components = [PopoverComponent, ConfirmComponent];

YuvComponentRegister.register(components);

/**
 * Use this module to inject a `PopoverService`.
 */

// based upon https://stackblitz.com/edit/cdk-popover-example-p1
@NgModule({
  declarations: [...components],
  exports: [...components],
  imports: [CommonModule, OverlayModule, PortalModule, YuvCommonModule]
})
export class YuvPopoverModule {}
