import { ChangeDetectorRef, Component, ElementRef, Input, Renderer2, ViewContainerRef } from '@angular/core';
import { TabPanel, TabView } from 'primeng/tabview';

// original TabPanel template should be copied in case of primeng update
// console.log(TabPanel.ɵcmp['type'].decorators[0].args[0].template);

@Component({
  selector: 'yuv-tab-panel',
  template: `
      <div
      *ngIf="!closed"
      class="p-tabview-panel"
      role="tabpanel"
      [hidden]="!selected"
      [attr.id]="tabView.getTabContentId(id)"
      [attr.aria-hidden]="!selected"
      [attr.aria-labelledby]="tabView.getTabHeaderActionId(id)"
      [attr.data-pc-name]="'tabpanel'"
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

  constructor(viewContainer: ViewContainerRef, cd: ChangeDetectorRef, el: ElementRef, renderer: Renderer2) {
    // TabPanel is created with fake TabView
    super(new TabView('id', el, cd, renderer), el, viewContainer, cd);
  }
}
