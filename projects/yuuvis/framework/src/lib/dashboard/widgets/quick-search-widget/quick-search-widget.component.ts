import { Component, Input } from '@angular/core';
import { SearchQuery } from '@yuuvis/core';
import { IWidgetComponent, WidgetGridEventService } from '@yuuvis/widget-grid';
import { WIDGET_EVT_QUICKSEARCH_EXECUTE } from '../../dashboard.interface';

@Component({
  selector: 'yuv-quick-search-widget',
  template: `<yuv-quick-search [inline]="true" (querySubmit)="onQuickSearchQuery($event)"></yuv-quick-search>`,
  styleUrls: ['./quick-search-widget.component.scss']
})
export class QuickSearchWidgetComponent implements IWidgetComponent {
  @Input() widgetConfig: any;

  constructor(private widgetGridEventService: WidgetGridEventService) {}

  onQuickSearchQuery(query: SearchQuery) {
    console.log(query);
    this.widgetGridEventService.trigger({
      action: WIDGET_EVT_QUICKSEARCH_EXECUTE,
      data: query
    });
  }
}
