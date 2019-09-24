export const datetimeElements = [
  {
    readonly: true,
    name: 'datetime:disabled',
    label: 'disabled datetime',
    description: '',
    type: 'datetime',
    required: false
  },
  {
    readonly: true,
    name: 'datetime:disabled:with:value',
    label: 'disabled datetime width value',
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
  },
  {
    readonly: false,
    name: 'datetime:four:width:value',
    label: 'date width value',
    withtime: true,
    description: 'a description',
    type: 'date',
    required: false
  },
  {
    readonly: false,
    name: 'datetime:five:required',
    label: 'date required',
    withtime: true,
    description: 'required date field',
    type: 'date',
    required: true
  }
];
