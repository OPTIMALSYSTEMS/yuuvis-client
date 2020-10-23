export const catalogElements = [
  {
    readonly: false,
    name: 'catalog',
    label: 'choose',
    description: 'simple catalog',
    classifications: ['catalog[Eins, Zwei, Drei, Vier, Fünf, Sechs, Sieben, Acht, Neun, Zehn]'],
    type: 'string',
    cardinality: 'single',
    required: false
  },
  {
    readonly: false,
    name: 'catalog:longtext',
    label: 'Long text items',
    description: 'Options with long text options',
    classifications: [
      'catalog[ Sed pulvinar neque nec laoreet venenatis quam arcu suscipit elit eget varius leo odio eu est, Fusce nibh sem varius id est sit amet finibus semper leo Vivamus orci purus egestas, Lorem ipsum dolor sit amet consectetur adipiscing elit]'
    ],
    type: 'string',
    cardinality: 'single',
    required: false
  },
  {
    readonly: false,
    name: 'catalog:multi',
    label: 'multiselect',
    description: 'multiselect catalog',
    classifications: ['catalog[Jeff, Lewis, Mark, Christian, Marko, Maximilian]'],
    cardinality: 'multi',
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'catalog:filter',
    label: 'Enabled filter panel',
    description: 'catalog with filter panel',
    classifications: ['catalog[1,2,3,4,5,6,7,8,9,10,11]'],
    cardinality: 'single',
    type: 'string',
    required: false
  },
  {
    readonly: false,
    name: 'catalog:filter:multi',
    label: 'Enabled filter panel multiselect',
    description: 'filter panel multiselect',
    classifications: ['catalog[1,2,3,4,5,6,7,8,9,10,11,12]'],
    cardinality: 'multi',
    type: 'string',
    required: false
  },
  {
    readonly: true,
    name: 'catalog:readonly',
    label: 'Readonly',
    description: 'readonly single',
    classifications: ['catalog[Hund, Katze, Esel]'],
    type: 'string',
    required: false
  },
  {
    readonly: true,
    name: 'catalog:readonly:multi',
    label: 'readonly multiselect',
    description: 'readonly multi',
    classifications: ['catalog[Hund, Katze, Esel]'],
    cardinality: 'multi',
    type: 'string',
    required: false
  }
];
