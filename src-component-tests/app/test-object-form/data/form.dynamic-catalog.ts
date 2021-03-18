export const dynamicCatalogElements = [
  {
    readonly: false,
    name: 'germanstates',
    label: 'German states',
    description: 'dynamic catalog',
    classifications: ['appClient:catalog[germancountries]'],
    type: 'string',
    cardinality: 'single',
    required: false
  },
  {
    readonly: false,
    name: 'germanstates:multi',
    label: 'German states',
    description: 'dynamic catalog multiselect',
    classifications: ['appClient:catalog[germancountries]'],
    type: 'string',
    cardinality: 'single',
    required: false
  },
  {
    readonly: false,
    name: 'germanstates:ro',
    label: 'German states (readonly)',
    description: 'dynamic readonly catalog',
    classifications: ['appClient:catalog[germancountries, readonly]'],
    type: 'string',
    cardinality: 'single',
    required: false
  },
  {
    readonly: false,
    name: 'processstate',
    label: 'Process status',
    description: 'dynamic catalog',
    classifications: ['appClient:catalog[processtatus]'],
    type: 'string',
    cardinality: 'single',
    required: false
  }
];
