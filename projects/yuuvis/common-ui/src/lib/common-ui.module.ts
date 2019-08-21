import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { SidebarModule } from 'primeng/sidebar';
import { AccordionComponent } from './components/accordion/accordion.component';
import { IconComponent } from './components/icon/icon.component';
import { IconService } from './components/icon/icon.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FocusWithinDirective } from './directives/focus-within.directive';

@NgModule({
  imports: [CommonModule, HttpClientModule, AccordionModule, SidebarModule],
  declarations: [IconComponent, FocusWithinDirective, AccordionComponent, SidebarComponent],
  exports: [IconComponent, FocusWithinDirective, AccordionComponent, SidebarComponent],
  providers: [IconService]
})
export class YuvCommonUiModule {}
