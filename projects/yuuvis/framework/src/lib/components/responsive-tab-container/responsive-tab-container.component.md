# yuv-responsive-tab-container

Container component for a tab container. Add `<p-tabPanel>` components to the container to creat a new tab.

```html
<!-- renders a tab panel with two tabs  -->
<yuv-responsive-tab-container>
  <p-tabPanel [id]="'panel-one'" [header]="'Tab one'">
    Tab contenten one
  </p-tabPanel>

  <p-tabPanel [id]="'panel-two'" [header]="'Tab two'">
    Tab contenten two
  </p-tabPanel>
</yuv-responsive-tab-container>
```

Example using deferrred loading of tab contents:

```html
<p-tabPanel [id]="'panel-one'" [header]="'Tab one'">
  <ng-template pTemplate="content">
    Tab contenten one
  </ng-template>
</p-tabPanel>
```

Surround your tab panels with `<ng-template pTemplate="content">` to enable them to be loaded only once the tab is clicked.
