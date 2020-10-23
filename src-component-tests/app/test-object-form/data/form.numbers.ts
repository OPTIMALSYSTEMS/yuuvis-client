export const numberElements = [
  // integers
  {
    readonly: false,
    name: 'integer:required',
    label: 'integer No. 1',
    description: 'required integer',
    type: 'integer',
    required: true
  },
  {
    readonly: false,
    name: 'integer:default',
    label: 'integer No. 2',
    description: 'default integer',
    type: 'integer',
    required: false
  },
  {
    readonly: true,
    name: 'integer:readonly',
    label: 'integer readonly',
    description: 'readonly integer',
    type: 'integer',
    required: true
  },
  {
    readonly: false,
    name: 'integer:four',
    label: 'integer between 10 and 155',
    description: 'integer between 10 and 155',
    type: 'integer',
    minValue: 10,
    maxValue: 155,
    required: false
  },
  {
    readonly: false,
    name: 'integer:class:digit',
    label: 'integer digit',
    description: 'integer classification digit',
    type: 'integer',
    classifications: ['digit'],
    required: false
  },

  // decimals
  {
    readonly: false,
    name: 'decimal:required',
    label: 'decimal No. 1',
    description: 'required decimal',
    type: 'decimal',
    required: true
  },
  {
    readonly: false,
    name: 'decimal:default',
    label: 'decimal No. 2',
    description: 'default decimal',
    type: 'decimal',
    required: false
  },
  {
    readonly: true,
    name: 'decimal:readonly',
    label: 'decimal readonly',
    description: 'readonly decimal',
    type: 'decimal',
    required: true
  },
  {
    readonly: false,
    name: 'decimal:four',
    label: 'decimal between 10.11 and 155.55',
    description: 'decimal between 10.11 and 155.55',
    type: 'decimal',
    minValue: 10.11,
    maxValue: 155.55,
    required: false
  },
  {
    readonly: false,
    name: 'decimal:class:digit',
    label: 'decimal digit',
    description: 'decimal classification digit',
    type: 'decimal',
    classifications: ['digit'],
    required: false
  },
];
