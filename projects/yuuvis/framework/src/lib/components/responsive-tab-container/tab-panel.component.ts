import { ChangeDetectorRef, Component, ElementRef, Inject, Input, PLATFORM_ID, Renderer2, ViewContainerRef } from '@angular/core';
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

  constructor(@Inject(PLATFORM_ID) private platformId: any, viewContainer: ViewContainerRef, cd: ChangeDetectorRef, el: ElementRef, private renderer: Renderer2) {
    // TabPanel is created with fake TabView
    super(new TabView(platformId, el, cd, renderer), el, viewContainer, cd);
  }
}
