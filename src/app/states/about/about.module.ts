import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonUiModule } from 'projects/yuuvis/common-ui/src/public-api';
import { AboutComponent } from './component/about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, YuvCommonUiModule]
})
export class AboutModule {}
