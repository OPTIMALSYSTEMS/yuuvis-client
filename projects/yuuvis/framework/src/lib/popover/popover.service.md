# PopoverService

`PopoverService` can be used to trigger modal dialogs in a convenient way.

## How to create a simple popup

First step is to define the template that should be displayed within the popup. Usually you would put this into the components HTML template that spinns off the dialog. This way, you have everything in a single file and no external references (Hint: You may also use a component instance instead of a template).

```html
<!-- demo.component.html -->
<ng-template #popupTemplate let-data let-popover="popover">
  <h1>{{data.title}}</h1>
  <p>{{data.message}}</p>
  <button (click)="onPopupResult('yes', popover)">Hell yeah!</button>
  <button (click)="onPopupResult('no', popover)">No!</button>
</ng-template>
```

The template is hooked up with a template variable so we are able to reference it from within the component. It also will be provided with some data and the instance of the popover itself.

```ts
// demo.component.ts

...
// get a reference to the template
@ViewChild('popupTemplate') popupTemplate: TemplateRef<any>;
...

showPopup() {
  // create config that defines the behaviour of the popup (size, position, ...)
  // and the data to be passed to the popup
  const popoverConfig: PopoverConfig = {
    maxHeight: '70%',
    data: {
      title: 'What do you think?',
      message: 'Should zebras have dots instead of stripes?'
    }
  };
  // open the popup
  this.popoverService.open(this.popupTemplate, popoverConfig);
}

onPopupResult(answer: any, popoverRef: PopoverRef) {
  // process data comming from the popup
  alert(`User said ${answer}.`)
  // close the popup afterwards using the popover reference
  popoverRef.close();
}

```

To influence the appearance an behavour of the popup you provide it with a [PopoverConfig](/interfaces/PopoverConfig.html).
