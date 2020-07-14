export const catalogElements = [
  {
    readonly: false,
    name: 'catalog',
    label: 'choose',
    description: '',
    classification: ['catalog[Eins, Zwei, Drei]'],
    type: 'string:catalog',
    required: false
  },
  {
    readonly: false,
    name: 'catalog:longtext',
    label: 'Long text items',
    description: 'Options with long text options',
    classification: [
      'catalog[ Sed pulvinar neque nec laoreet venenatis quam arcu suscipit elit eget varius leo odio eu est, Fusce nibh sem varius id est sit amet finibus semper leo Vivamus orci purus egestas, Lorem ipsum dolor sit amet consectetur adipiscing elit]'
    ],
    type: 'string:catalog',
    required: false
  },
  {
    readonly: false,
    name: 'catalog:multi',
    label: 'Multiselect',
    description: '',
    classification: ['catalog[Jeff, Lewis, Mark]'],
    cardinality: 'multi',
    type: 'string:catalog',
    required: false
  },
  {
    readonly: false,
    name: 'catalog:filter',
    label: 'Enabled filter panel',
    description: '',
    classification: ['catalog[1,2,3,4,5,6,7,8,9,10,11,12]'],
    type: 'string:catalog',
    required: false
  },
  {
    readonly: false,
    name: 'catalog:filter:multi',
    label: 'Enabled filter panel multiselect',
    description: '',
    classification: ['catalog[1,2,3,4,5,6,7,8,9,10,11,12]'],
    cardinality: 'multi',
    type: 'string:catalog',
    required: false
  },
  {
    readonly: true,
    name: 'catalog:readonly',
    label: 'Readonly',
    description: '',
    classification: ['catalog[Hund, Katze, Esel]'],
    type: 'string:catalog',
    required: false
  },
  {
    readonly: true,
    name: 'catalog:readonly:multi',
    label: 'Readonly multiselect',
    description: '',
    classification: ['catalog[Hund, Katze, Esel]'],
    cardinality: 'multi',
    type: 'string:catalog',
    required: false
  }
];
