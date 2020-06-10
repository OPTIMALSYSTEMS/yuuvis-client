export const numberElements = [
  // integers
  {
    readonly: false,
    name: 'integer:one',
    label: 'integer No. 1',
    description: 'required integer',
    _internalType: 'integer',
    required: true
  },
  {
    readonly: false,
    name: 'integer:two',
    label: 'integer No. 2',
    description: 'default integer',
    _internalType: 'integer',
    required: false
  },
  {
    readonly: true,
    name: 'integer:three',
    label: 'integer readonly',
    description: 'readonly integer',
    _internalType: 'integer',
    required: true
  },
  {
    readonly: false,
    name: 'integer:four',
    label: 'integer between 10 and 155',
    description: 'integer between 10 and 155',
    _internalType: 'integer',
    minValue: 10,
    maxValue: 155,
    required: false
  },

  // decimals
  {
    readonly: false,
    name: 'decimal:one',
    label: 'decimal No. 1',
    description: 'required decimal',
    _internalType: 'decimal',
    required: true
  },
  {
    readonly: false,
    name: 'decimal:two',
    label: 'decimal No. 2',
    description: 'default decimal',
    _internalType: 'decimal',
    required: false
  },
  {
    readonly: true,
    name: 'decimal:three',
    label: 'decimal readonly',
    description: 'readonly decimal',
    _internalType: 'decimal',
    required: true
  },
  {
    readonly: false,
    name: 'decimal:four',
    label: 'decimal between 10.11 and 155.55',
    description: 'decimal between 10.11 and 155.55',
    _internalType: 'decimal',
    minValue: 10.11,
    maxValue: 155.55,
    required: false
  }
];
