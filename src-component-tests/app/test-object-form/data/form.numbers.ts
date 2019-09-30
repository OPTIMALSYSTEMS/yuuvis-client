export const numberElements = [
  // integers
  {
    readonly: false,
    name: 'integer:one',
    label: 'integer No. 1',
    description: 'required integer',
    type: 'integer',
    required: true
  },
  {
    readonly: false,
    name: 'integer:two',
    label: 'integer No. 2',
    description: 'default integer',
    type: 'integer',
    required: false
  },
  {
    readonly: true,
    name: 'integer:three',
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
    min: 10,
    max: 155,
    required: false
  },

  // decimals
  {
    readonly: false,
    name: 'decimal:one',
    label: 'decimal No. 1',
    description: 'required decimal',
    type: 'decimal',
    required: true
  },
  {
    readonly: false,
    name: 'decimal:two',
    label: 'decimal No. 2',
    description: 'default decimal',
    type: 'decimal',
    required: false
  },
  {
    readonly: true,
    name: 'decimal:three',
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
    min: 10.11,
    max: 155.55,
    required: false
  }
];
