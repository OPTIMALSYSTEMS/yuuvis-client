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
  }
];
