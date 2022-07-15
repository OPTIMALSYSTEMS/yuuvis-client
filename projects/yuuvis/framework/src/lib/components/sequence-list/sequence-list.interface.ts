export interface SequenceItem {
  title: string;
  expiryDatetime?: Date;
  nextAssignee: string;
  nextAssignee_title: string;
}

export enum SequenceListChangeMode {
  EDIT = 'edit',
  DELETE = 'delete',
  INSERT = 'insert'
}

export interface SequenceListChangeOutput {
  index: number;
  mode: SequenceListChangeMode;
}
