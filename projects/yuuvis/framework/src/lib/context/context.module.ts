import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { YuvActionModule } from '../actions/action.module';
import { YuvColumnConfigModule } from '../column-config/column-config.module';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvSearchModule } from '../search/search.module';
import { YuvPipesModule } from './../pipes/pipes.module';
import { ContextPickerComponent } from './context-picker/context-picker.component';
import { ContextComponent } from './context/context.component';

@NgModule({
  declarations: [ContextComponent, ContextPickerComponent],
  exports: [ContextComponent, ContextPickerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    YuvActionModule,
    TranslateModule,
    YuvDirectivesModule,
    YuvPipesModule,
    YuvSearchModule,
    YuvCommonModule,
    YuvComponentsModule,
    YuvColumnConfigModule
  ]
})
export class YuvContextModule {}
