import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AccordionModule, SidebarModule } from 'primeng/primeng';
import { AccordionComponent } from './components/accordion/accordion.component';
import { IconComponent } from './components/icon/icon.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FocusWithinDirective } from './directives/focus-within.directive';

@NgModule({
  imports: [CommonModule, HttpClientModule, AccordionModule, SidebarModule],
  declarations: [
    IconComponent,
    FocusWithinDirective,
    AccordionComponent,
    SidebarComponent
  ],
  exports: [
    IconComponent,
    FocusWithinDirective,
    AccordionComponent,
    SidebarComponent
  ]
})
export class YuvCommonUiModule {}
