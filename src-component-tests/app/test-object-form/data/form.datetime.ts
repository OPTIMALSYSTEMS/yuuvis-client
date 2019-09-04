export const datetimeElements = [
  {
    readonly: false,
    name: 'datetime:one',
    label: 'Checkbox No. 1',
    description: 'checkbox with a description',
    type: 'datetime',
    required: true
  },
  {
    readonly: true,
    name: 'datetime:disabled',
    label: 'disabled datetim',
    description: '',
    type: 'datetime',
    required: false
  },
  {
    readonly: false,
    name: 'datetime:two',
    label: 'default datetime',
    description: '',
    type: 'datetime',
    required: false
  },
  {
    readonly: false,
    name: 'datetime:three',
    label: 'datetime with time',
    withTime: true,
    description: 'a description',
    type: 'datetime',
    required: false
  }
];
