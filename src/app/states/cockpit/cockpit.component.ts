import { Component, OnInit } from '@angular/core';
import { AppCacheService } from '@yuuvis/core';
import { GridItemEvent, WidgetGridItemConfig, WidgetGridRegistry, WidgetGridUtils } from '@yuuvis/widget-grid';
import {
  ChartsSetupComponent,
  ChartsWidgetComponent,
  HitlistSetupComponent,
  HitlistWidgetComponent,
  StoredQuerySetupComponent,
  StoredQueryWidgetComponent
} from '@yuuvis/widget-grid-widgets';

@Component({
  selector: 'yuv-cockpit',
  templateUrl: './cockpit.component.html',
  styleUrls: ['./cockpit.component.scss'],
  host: {
    class: 'themeBackground'
  }
})
export class CockpitComponent implements OnInit {
  private STORAGE_KEY = 'yuv.client.cockpit.widgetgrid';
  gridItemConfig: Array<WidgetGridItemConfig> = [];
  gridEditMode: boolean = false;

  constructor(private appCache: AppCacheService, private widgetGridRegistry: WidgetGridRegistry) {}

  onGridEvent(e: GridItemEvent) {
    console.log(e);
  }

  private registerWidgets() {
    this.widgetGridRegistry.registerGridWidgets([
      {
        name: 'yuv.widget.hitlist',
        label: 'Hitlist or count tile',
        setupComponent: HitlistSetupComponent,
        widgetComponent: HitlistWidgetComponent
      },
      {
        name: 'yuv.widget.storedquery',
        label: 'Stored query',
        setupComponent: StoredQuerySetupComponent,
        widgetComponent: StoredQueryWidgetComponent
      },
      {
        name: 'yuv.widget.charts',
        label: 'Charts',
        setupComponent: ChartsSetupComponent,
        widgetComponent: ChartsWidgetComponent
      }
    ]);
  }

  ngOnInit(): void {
    this.registerWidgets();
    this.appCache.getItem(this.STORAGE_KEY).subscribe((res) => {
      this.gridItemConfig = res ? WidgetGridUtils.gridConfigParse(res as string) : [];
    });
  }
}
