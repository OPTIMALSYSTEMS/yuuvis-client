import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@yuuvis/core';
import { YuvComponentsModule } from '../components/components.module';
import { ObjectCreateComponent } from './object-create/object-create.component';

@NgModule({
  declarations: [ObjectCreateComponent],
  exports: [ObjectCreateComponent],
  imports: [CommonModule, YuvComponentsModule, CdkStepperModule, TranslateModule]
})
export class YuvObjectCreateModule {}
