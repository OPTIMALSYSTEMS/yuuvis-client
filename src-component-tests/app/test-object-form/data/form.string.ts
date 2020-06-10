export const stringElements = [
  {
    readonly: false,
    name: 'string:one',
    label: 'required string',
    description: '',
    _internalType: 'string',
    required: true
  },
  {
    readonly: false,
    name: 'string:two',
    label: 'default string',
    description: '',
    _internalType: 'string',
    required: false
  },
  {
    readonly: true,
    name: 'string:three',
    label: 'readonly string',
    description: 'string field supposed to be inactive',
    _internalType: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:four',
    label: 'String with RegExp',
    description: 'enter valid time like eg. hh:mm',
    regex: '^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$',
    _internalType: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:minmax',
    label: 'String with Min/Max',
    description: 'enter string between 3 and 10 characters',
    maxLength: 10,
    minLength: 3,
    _internalType: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:email',
    label: 'String Classification email',
    description: 'enter valid email address',
    classification: ['email'],
    _internalType: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:url',
    label: 'String Classification url',
    description: 'enter valid url address',
    classification: ['url'],
    _internalType: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:phone',
    label: 'String Classification phone',
    description: 'enter a phone number',
    classification: ['phone'],
    _internalType: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:multiline',
    label: 'String multiline',
    description: '',
    cardinality: 'multi',
    _internalType: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:chips',
    label: 'String multiple entries',
    description: 'enter multiple entries',
    cardinality: 'multi',
    _internalType: 'string',
    required: false
  },
  {
    readonly: false,
    cardinality: 'multi',
    name: 'string:chips:email',
    label: 'String Classification email multiple',
    classification: ['email'],
    _internalType: 'string',
    required: false
  },
  {
    readonly: false,
    cardinality: 'multi',
    name: 'string:chips:url',
    label: 'String Classification URL multiple',
    classification: ['url'],
    _internalType: 'string',
    required: false
  },
  {
    readonly: false,
    cardinality: 'multi',
    name: 'string:chips:phone',
    label: 'String Classification phone multiple',
    classification: ['phone'],
    _internalType: 'string',
    required: false
  }
];
