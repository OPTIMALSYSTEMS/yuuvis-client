import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { YuvComponentsModule } from '../components/components.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { VersionListComponent } from './version-list/version-list.component';

const components = [VersionListComponent];

@NgModule({
  declarations: [...components],
  exports: [...components],
  imports: [CommonModule, YuvComponentsModule, TranslateModule, YuvPipesModule, YuvCommonUiModule]
})
export class YuvVersionsModule {}
