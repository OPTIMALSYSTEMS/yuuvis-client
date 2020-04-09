import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Component, ComponentRef, EmbeddedViewRef, Optional, ViewChild } from '@angular/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { PopoverRef } from '../popover.ref';
import { clear } from './../../svg.generated';
@Component({
  selector: 'yuv-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss']
})
export class PopoverComponent extends BasePortalOutlet {
  @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet: CdkPortalOutlet;
  disableSmallScreenClose: boolean;

  constructor(@Optional() private popoverRef: PopoverRef, private iconRegistry: IconRegistryService) {
    super();
    this.disableSmallScreenClose = popoverRef.config.disableSmallScreenClose;
    this.iconRegistry.registerIcons([clear]);
  }

  attachComponentPortal<T>(componentPortal: ComponentPortal<any>): ComponentRef<T> {
    return this.portalOutlet.attachComponentPortal(componentPortal);
  }

  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    return this.portalOutlet.attachTemplatePortal(portal);
  }

  close() {
    this.popoverRef.close();
  }
}
