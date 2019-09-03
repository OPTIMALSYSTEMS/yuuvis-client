# yuv-string

Creates form input for strings. Based on the input values different kinds of inputs will be generated.

| property       | type    | description                                                                                                                                                                                                    |
| -------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| multiselect    | boolean | indicator that multiple strings could be inserted                                                                                                                                                              |
| multiline      | boolean | Use multiline input (textarea instead of input)                                                                                                                                                                |
| size           | string  | Use in combination with `multiline` to define the size (height) of the textarea. Valid values are `small`,`medium`,`large`                                                                                     |
| readonly       | boolean | prevents the inputs value from being changed (disabled)                                                                                                                                                        |
| situation      | string  | Possibles values are `EDIT` (default),`SEARCH`,`CREATE`. In search situation validation of the form element will be turned off, so you are able to enter search terms that do not meet the elements validators |
| regex          | string  | Regular expression to validate the input value against                                                                                                                                                         |
| minLength      | number  | minimal number of characters                                                                                                                                                                                   |
| maxLength      | number  | maximum number of characters                                                                                                                                                                                   |
| classification | string  | possible values are `email` (validates and creates a link to send an email once there is a valid email address) and `url` (validates and creates a link to an URL typed into the form element).                |

## Examples

```html
<!-- string input validating input to be between 5 and 10 characters -->
<yuv-string [minLength]="5" [maxLength]="10"></yuv-string>
```

```html
<!-- string input that only allow digits -->
<yuv-string [regex]="[0-9]*"></yuv-string>
```

```html
<!-- string input rendering a large textarea -->
<yuv-string [multiline]="true" [size]="'large'"></yuv-string>
```

## `<yuv-form-input>` wrapper

In order to add a proper label to this component you may wrap it using `<yuv-form-input>` component.
