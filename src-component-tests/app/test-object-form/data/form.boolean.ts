export const booleanElements = [
  {
    readonly: false,
    name: 'boolean:default',
    label: 'default',
    description: 'default checkbox',
    _internalType: 'boolean',
    required: false
  },
  {
    readonly: false,
    name: 'boolean:one',
    label: 'required checkbox',
    description: 'mandatory checkbox',
    _internalType: 'boolean',
    required: true
  },
  {
    readonly: true,
    name: 'boolean:readonly',
    label: 'readonly checkbox',
    description: 'readonly without value',
    _internalType: 'boolean',
    required: false
  },
  {
    readonly: true,
    name: 'boolean:readonlyvalue',
    label: 'readonly checkbox with value',
    description: 'readonly with value',
    _internalType: 'boolean',
    required: false
  },
  {
    readonly: false,
    name: 'boolean:tristate',
    label: 'tristate checkbox',
    tristate: true,
    description: '',
    _internalType: 'boolean',
    required: false
  },
  {
    readonly: false,
    name: 'boolean:requiredtristate',
    label: 'required tristate checkbox',
    tristate: true,
    description: 'mandatory checkbox',
    _internalType: 'boolean',
    required: true
  }
];
