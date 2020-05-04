import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { SidebarModule } from 'primeng/sidebar';
import { EmptyComponent } from './components/empty/empty.component';
import { IconComponent } from './components/icon/component/icon.component';
import { IconService } from './components/icon/service/icon.service';
import { IconRegistryService } from './components/icon/service/iconRegistry.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FocusWithinDirective } from './directives/focus-within.directive';
import { RouterLinkDirective } from './directives/router-link.directive';

@NgModule({
  imports: [CommonModule, HttpClientModule, AccordionModule, SidebarModule],
  declarations: [IconComponent, FocusWithinDirective, SidebarComponent, EmptyComponent, RouterLinkDirective],
  exports: [IconComponent, FocusWithinDirective, SidebarComponent, EmptyComponent, RouterLinkDirective],
  providers: [IconService, IconRegistryService]
})
export class YuvCommonModule {}
