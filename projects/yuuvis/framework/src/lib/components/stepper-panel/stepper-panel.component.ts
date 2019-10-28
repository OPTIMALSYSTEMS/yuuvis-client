import { CdkStepper } from '@angular/cdk/stepper';
import { Component } from '@angular/core';

/**
 * Component for rendering a stepper panel.
 */
@Component({
  selector: 'yuv-stepper-panel',
  templateUrl: './stepper-panel.component.html',
  styleUrls: ['./stepper-panel.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: StepperPanelComponent }]
})
export class StepperPanelComponent extends CdkStepper {
  onClick(index: number): void {
    this.selectedIndex = index;
  }
}
