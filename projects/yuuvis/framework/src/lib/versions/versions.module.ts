import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { VersionListComponent } from './version-list/version-list.component';

const versionComponents = [VersionListComponent];

@NgModule({
  declarations: [...versionComponents],
  exports: [...versionComponents],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, YuvComponentsModule, TranslateModule, YuvPipesModule, YuvCommonModule]
})
export class YuvVersionsModule {}
