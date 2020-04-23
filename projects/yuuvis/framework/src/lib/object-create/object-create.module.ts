import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvFormModule } from '../form/form.module';
import { YuvGroupedSelectModule } from '../grouped-select/grouped-select.module';
import { YuvObjectFormModule } from '../object-form/object-form.module';
import { ObjectCreateComponent } from './object-create/object-create.component';

@NgModule({
  declarations: [ObjectCreateComponent],
  exports: [ObjectCreateComponent],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    YuvCommonModule,
    YuvComponentsModule,
    FormsModule,
    YuvFormModule,
    YuvGroupedSelectModule,
    YuvObjectFormModule,
    CdkStepperModule,
    YuvDirectivesModule,
    TranslateModule
  ]
})
export class YuvObjectCreateModule {}
