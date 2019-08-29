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
    label: 'integer No.2',
    description: '',
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
    label: 'decimal No.2',
    description: '',
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
  }
];
