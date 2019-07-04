import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SidebarModule } from 'primeng/primeng';
import { SidebarComponent } from './component/sidebar.component';

@NgModule({
  declarations: [SidebarComponent],
  imports: [CommonModule, SidebarModule],
  exports: [SidebarComponent]
})
export class YuvNavigationModule {}
