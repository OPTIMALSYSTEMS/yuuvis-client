import { Component, Input } from '@angular/core';
import { SearchQuery } from '@yuuvis/core';
import { IWidgetComponent } from '@yuuvis/widget-grid';

@Component({
  selector: 'yuv-quick-search-widget',
  template: `<yuv-quick-search [inline]="true" (querySubmit)="onQuickSearchQuery($event)"></yuv-quick-search>`,
  styleUrls: ['./quick-search-widget.component.scss']
})
export class QuickSearchWidgetComponent implements IWidgetComponent {
  @Input() widgetConfig: any;

  onQuickSearchQuery(query: SearchQuery) {
    console.log(query);
  }
}
