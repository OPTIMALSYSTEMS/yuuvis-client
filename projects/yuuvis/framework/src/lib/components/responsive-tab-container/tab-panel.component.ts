import { ChangeDetectorRef, Component, ElementRef, Input, ViewContainerRef } from '@angular/core';
import { TabPanel, TabView } from 'primeng/tabview';

// original TabPanel template should be copied in case of primeng update
// console.log(TabPanel.ɵcmp['type'].decorators[0].args[0].template);

@Component({
  selector: 'yuv-tab-panel',
  template: `
    <div
      [attr.id]="id"
      class="p-tabview-panel"
      [hidden]="!selected"
      role="tabpanel"
      [attr.aria-hidden]="!selected"
      [attr.aria-labelledby]="id + '-label'"
      *ngIf="!closed"
    >
      <ng-content></ng-content>
      <ng-container *ngIf="contentTemplate && (cache ? loaded : selected)">
        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
      </ng-container>
    </div>
  `,
  styleUrls: []
})
export class TabPanelComponent extends TabPanel {
  @Input() loaded: boolean;

  constructor(viewContainer: ViewContainerRef, cd: ChangeDetectorRef, el: ElementRef) {
    // TabPanel is created with fake TabView
    super(new TabView('id', el, cd), viewContainer, cd);
  }
}
