import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { AboutComponent } from './component/about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, YuvCommonUiModule]
})
export class AboutModule {}
