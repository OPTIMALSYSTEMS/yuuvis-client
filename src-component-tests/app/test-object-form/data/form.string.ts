export const stringElements = [
  {
    readonly: false,
    name: 'string:one',
    label: 'required string',
    description: '',
    type: 'string',
    required: true
  },
  {
    readonly: false,
    name: 'string:two',
    label: 'default string',
    description: '',
    type: 'string',
    required: false
  },
  {
    readonly: true,
    name: 'string:three',
    label: 'readonly string',
    description: 'string field supposed to be inactive',
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:four',
    label: 'String with RegExp',
    description: 'enter valid time like eg. hh:mm',
    regex: '^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$',
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:minmax',
    label: 'String with Min/Max',
    description: 'enter string between 3 and 10 characters',
    maxlen: 10,
    minlen: 3,
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:email',
    label: 'String Classification email',
    description: 'enter valid email address',
    classification: 'email',
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:url',
    label: 'String Classification url',
    description: 'enter valid url address',
    classification: 'url',
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:multiline',
    label: 'String multiline',
    description: 'enter multiline string',
    classification: 'url',
    multiline: true,
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'string:chips',
    label: 'String multiple entries',
    description: 'enter multiple entries',
    multiselect: true,
    type: 'string',
    required: false
  }
];
