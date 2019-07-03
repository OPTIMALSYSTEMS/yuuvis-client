import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { AboutComponent } from './component/about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, TranslateModule, YuvCommonUiModule]
})
export class AboutModule {}
