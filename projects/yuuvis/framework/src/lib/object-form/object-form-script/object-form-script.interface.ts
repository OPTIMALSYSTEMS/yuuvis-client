
// interface for DMS-Objects passed to the scripting scope,
// inside of the scripting scopes objects array
export interface FormScriptDmsObject {
  id: string,
  title: string,
  description: string,
  type: string,
  created: string | Date,
  creator: string
  modified: string | Date,
  modifier: string
  data: any
}

