import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { YuvComponentsModule } from '../components/components.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { VersionCompareTriggerComponent } from './version-compare-trigger/version-compare-trigger.component';
import { VersionListComponent } from './version-list/version-list.component';

const components = [VersionListComponent];

@NgModule({
  declarations: [...components, VersionCompareTriggerComponent],
  exports: [...components],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, YuvComponentsModule, TranslateModule, YuvPipesModule, YuvCommonUiModule]
})
export class YuvVersionsModule {}
