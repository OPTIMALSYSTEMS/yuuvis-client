Container component for a tab container. Add `<yuv-tab-panel>` components to the container to creat a new tab.

```html
<!-- renders a tab panel with two tabs  -->
<yuv-responsive-tab-container>
  <yuv-tab-panel [id]="'panel-one'" [header]="'Tab one'"> Tab contenten one </yuv-tab-panel>

  <yuv-tab-panel [id]="'panel-two'" [header]="'Tab two'"> Tab contenten two </yuv-tab-panel>
</yuv-responsive-tab-container>
```

Example using deferrred loading of tab contents:

```html
<yuv-tab-panel [id]="'panel-one'" [header]="'Tab one'">
  <ng-template pTemplate="content"> Tab contenten one </ng-template>
</yuv-tab-panel>
```

Surround your tab panels with `<ng-template pTemplate="content">` to enable them to be loaded only once the tab is clicked.
