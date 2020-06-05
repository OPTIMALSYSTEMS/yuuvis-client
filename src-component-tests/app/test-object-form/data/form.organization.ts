export const organizationElements = [
  {
    readonly: false,
    name: 'id:organization',
    label: 'user',
    description: '',
    classification: ['id:organization'],
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:multi',
    label: 'multiselect',
    description: '',
    multiselect: true,
    classification: ['id:organization'],
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:value',
    label: 'initioal value',
    description: '',
    multiselect: true,
    classification: ['id:organization'],
    type: 'string',
    required: false
  },
  {
    readonly: true,
    name: 'id:organization:readonly',
    label: 'readonly',
    description: '',
    multiselect: true,
    classification: ['id:organization'],
    type: 'string',
    required: false
  }
];
