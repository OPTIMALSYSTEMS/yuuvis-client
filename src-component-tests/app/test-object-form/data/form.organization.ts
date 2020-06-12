export const organizationElements = [
  {
    readonly: false,
    name: 'id:organization',
    label: 'user',
    description: '',
    classification: ['id:organization'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:multi',
    label: 'multiselect',
    description: '',
    cardinality: 'multi',
    classification: ['id:organization'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:value',
    label: 'initioal value',
    description: '',
    cardinality: 'multi',
    classification: ['id:organization'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: true,
    name: 'id:organization:readonly',
    label: 'readonly',
    description: '',
    cardinality: 'multi',
    classification: ['id:organization'],
    type: 'string:organization',
    required: false
  }
];
