export const dynamicCatalogElements = [
  {
    readonly: false,
    name: 'personalclass',
    label: 'class',
    description: 'dynamic catalog',
    classifications: ['dynamic:catalog[appPersonalfile:juergen]'],
    type: 'string',
    cardinality: 'single',
    required: false
  },
  {
    readonly: false,
    name: 'germanstates:multi',
    label: 'German states',
    description: 'dynamic catalog multiselect',
    classifications: ['dynamic:catalog[germancountries]'],
    type: 'string',
    cardinality: 'multi',
    required: false
  },
  {
    readonly: true,
    name: 'germanstates:ro',
    label: 'German states (readonly)',
    description: 'dynamic readonly catalog',
    classifications: ['dynamic:catalog[germancountries]'],
    type: 'string',
    cardinality: 'single',
    required: false
  },
  {
    readonly: false,
    name: 'germanstates:noteditable',
    label: 'German states (not editable)',
    description: 'dynamic catalog that could not be edited',
    classifications: ['dynamic:catalog[germancountries, readonly]'],
    type: 'string',
    cardinality: 'single',
    required: false
  },
  {
    readonly: false,
    name: 'notthere',
    label: 'Process status',
    description: "dynamic catalog that isn't there",
    classifications: ['dynamic:catalog[xyz]'],
    type: 'string',
    cardinality: 'single',
    required: false
  },
  {
    readonly: false,
    name: 'processstate:prefix',
    label: 'Process status',
    description: 'namespaced dynamic catalog',
    classifications: ['dynamic:catalog[tenKolibri:processstatus]'],
    type: 'string',
    cardinality: 'single',
    required: false
  }
];
