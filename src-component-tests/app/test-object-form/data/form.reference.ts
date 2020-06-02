export const referenceElements = [
  {
    readonly: false,
    name: 'id:reference:multi',
    label: 'multiselect',
    description: '',
    multiselect: true,
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
  }
];
