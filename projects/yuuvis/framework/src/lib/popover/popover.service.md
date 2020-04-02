# PopoverService

`PopoverService` can be used to trigger modal dialogs in a convenient way.

## How to create a simple popup from ng-template

First step is to define the template that should be displayed within the popup. Usually you would put this into the components HTML template that spinns off the dialog. This way, you have everything in a single file and no external references (Hint: You may also use a component instance instead of a template

```html
<ng-template #tplColumnPicker let-data let-popover="popover">
  <!-- everything within the template will be rendered inside the popup -->
  <yuv-column-picker [groups]="data.groups" (cancel)="onPickerCancel(popover)" (select)="onPickerResult($event, popover)"></yuv-column-picker>
</ng-template>
```
