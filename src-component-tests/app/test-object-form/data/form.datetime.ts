export const datetimeElements = [
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
    withtime: true,
    description: 'a description',
    type: 'datetime',
    required: false
  },
  {
    readonly: false,
    name: 'datetime:four',
    label: 'date',
    withtime: true,
    description: 'a description',
    type: 'date',
    required: false
  }
];
