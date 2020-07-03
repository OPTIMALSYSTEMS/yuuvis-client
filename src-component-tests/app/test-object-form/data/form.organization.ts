export const organizationElements = [
  {
    readonly: false,
    name: 'id:organization',
    label: 'user',
    description: 'single orga field',
    classification: ['id:organization'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:multi',
    label: 'multiselect',
    description: 'multi  orga field',
    cardinality: 'multi',
    classification: ['id:organization'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:value',
    label: 'initial value',
    description: 'with initial value',
    cardinality: 'multi',
    classification: ['id:organization'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: true,
    name: 'id:organization:readonly',
    label: 'readonly',
    description: 'read-only orga field',
    cardinality: 'multi',
    classification: ['id:organization'],
    type: 'string:organization',
    required: false
  }
];
