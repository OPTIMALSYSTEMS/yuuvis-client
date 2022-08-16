import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@yuuvis/core';
import { AngularSplitModule } from 'angular-split';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvFloatingSotSelectModule } from '../floating-sot-select/floating-sot-select.module';
import { YuvFormModule } from '../form/form.module';
import { YuvGroupedSelectModule } from '../grouped-select/grouped-select.module';
import { YuvObjectDetailsModule } from '../object-details/object-details.module';
import { YuvObjectFormModule } from '../object-form/object-form.module';
import { YuvComponentRegister } from './../shared/utils/utils';
import { ObjectCreateComponent } from './object-create/object-create.component';

YuvComponentRegister.register([ObjectCreateComponent]);

/**
 * Module providing `ObjectCreateComponent`
 */
@NgModule({
  declarations: [ObjectCreateComponent],
  exports: [ObjectCreateComponent],
  imports: [
    CommonModule,
    YuvCommonModule,
    YuvComponentsModule,
    YuvFloatingSotSelectModule,
    FormsModule,
    YuvFormModule,
    YuvGroupedSelectModule,
    YuvObjectFormModule,
    AngularSplitModule,
    CdkStepperModule,
    YuvDirectivesModule,
    ScrollingModule,
    TranslateModule,
    YuvObjectDetailsModule
  ]
})
export class YuvObjectCreateModule {}
