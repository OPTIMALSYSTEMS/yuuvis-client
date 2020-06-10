export const referenceElements = [
  {
    readonly: false,
    name: 'id:reference:multi',
    label: 'multiselect',
    description: '',
    cardinality: 'multi',
    classification: ['id:reference'],
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'id:reference:restricted ',
    label: 'restricted',
    description: 'Restricted to a certain target type',
    multiselect: false,
    classification: ['id:reference[system:folder]'],
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'id:reference:value',
    label: 'with initial value',
    description: '',
    classification: ['id:reference'],
    multiselect: false,
    type: 'string',
    required: false
  },
  {
    readonly: true,
    name: 'id:reference:readonly',
    label: 'readonly with initial value',
    description: '',
    classification: ['id:reference'],
    multiselect: false,
    type: 'string',
    required: false
  }
];
