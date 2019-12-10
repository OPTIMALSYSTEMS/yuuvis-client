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
    label: 'disabled datetime with value',
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
    description: 'a description',
    type: 'datetime',
    required: false
  },
  {
    readonly: false,
    name: 'datetime:four',
    label: 'date',
    resolution: 'date',
    description: 'a description',
    type: 'datetime',
    required: false
  },
  {
    readonly: false,
    name: 'date:four:with:value',
    label: 'date with value',
    resolution: 'date',
    description: 'a description',
    type: 'datetime',
    required: false
  },
  {
    readonly: false,
    name: 'date:five:required',
    label: 'date required',
    resolution: 'date',
    description: 'required date field',
    type: 'datetime',
    required: true
  }
];
