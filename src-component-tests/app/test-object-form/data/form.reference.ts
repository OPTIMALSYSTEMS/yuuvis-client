export const referenceElements = [
  {
    readonly: false,
    name: 'id:reference:multi',
    label: 'multiselect',
    description: 'multiselect',
    cardinality: 'multi',
    classifications: ['id:reference'],
    type: 'string:reference',
    required: false
  },
  {
    readonly: false,
    name: 'id:reference:restricted ',
    label: 'restricted',
    description: 'restricted to a certain target type',
    multiselect: false,
    classifications: ['id:reference[system:folder]'],
    type: 'string:reference',
    required: false
  },
  {
    readonly: false,
    name: 'id:reference:value',
    label: 'with initial value',
    description: 'with initial value',
    classifications: ['id:reference'],
    multiselect: false,
    type: 'string:reference',
    required: false
  },
  {
    readonly: true,
    name: 'id:reference:readonly',
    label: 'readonly with initial value',
    description: 'readonly',
    classifications: ['id:reference'],
    multiselect: false,
    type: 'string:reference',
    required: false
  }
];
