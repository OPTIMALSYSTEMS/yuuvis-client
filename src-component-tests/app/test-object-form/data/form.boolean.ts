export const booleanElements = [
  {
    readonly: false,
    name: 'boolean:default',
    label: 'default',
    description: '',
    type: 'boolean',
    required: false
  },
  {
    readonly: false,
    name: 'boolean:one',
    label: 'checkbox',
    description: 'a checkbox with a description',
    type: 'boolean',
    required: true
  },
  {
    readonly: true,
    name: 'boolean:readonly',
    label: 'readonly checkbox',
    description: '',
    type: 'boolean',
    required: false
  },
  {
    readonly: false,
    name: 'boolean:tristate',
    label: 'tristate checkbox',
    tristate: true,
    description: '',
    type: 'boolean',
    required: false
  }
];
