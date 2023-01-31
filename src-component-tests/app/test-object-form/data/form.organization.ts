export const organizationElements = [
  {
    readonly: false,
    name: 'id:organization',
    label: 'user',
    description: 'single orga field',
    classifications: ['id:organization'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:multi',
    label: 'multiselect',
    description: 'multi  orga field',
    cardinality: 'multi',
    classifications: ['id:organization'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:value',
    label: 'initial value',
    description: 'with initial value',
    cardinality: 'multi',
    classifications: ['id:organization'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: true,
    name: 'id:organization:readonly',
    label: 'readonly',
    description: 'read-only orga field',
    cardinality: 'multi',
    classifications: ['id:organization'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:limited',
    label: 'limited by roles',
    description: 'orga field limited to certain roles',
    cardinality: 'multi',
    classifications: ['id:organization[roles:APPROVER1,APPROVER2]'],
    type: 'string:organization',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:set',
    label: 'Organization set',
    description: 'multiselect orga set with users and roles',
    cardinality: 'multi',
    classifications: ['id:organization:set[user,role]'],
    type: 'string:organization:set',
    required: false
  },
  {
    readonly: false,
    name: 'id:organization:set:roles',
    label: 'Organization set roles only',
    description: 'single select orga set with just roles',
    cardinality: 'single',
    classifications: ['id:organization:set[role]'],
    type: 'string:organization:set',
    required: false
  }
];
