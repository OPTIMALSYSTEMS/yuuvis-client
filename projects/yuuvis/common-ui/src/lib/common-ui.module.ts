import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { IconRegistryService } from '@yuuvis/common-ui';
import { AccordionModule } from 'primeng/accordion';
import { SidebarModule } from 'primeng/sidebar';
import { EmptyComponent } from './components/empty/empty.component';
import { IconComponent } from './components/icon/component/icon.component';
import { IconService } from './components/icon/service/icon.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FocusWithinDirective } from './directives/focus-within.directive';

@NgModule({
  imports: [CommonModule, HttpClientModule, AccordionModule, SidebarModule],
  declarations: [IconComponent, FocusWithinDirective, SidebarComponent, EmptyComponent],
  exports: [IconComponent, FocusWithinDirective, SidebarComponent, EmptyComponent, IconRegistryService],
  providers: [IconService, IconRegistryService]
})
export class YuvCommonUiModule {}
