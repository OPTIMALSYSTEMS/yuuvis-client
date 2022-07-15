export interface SequenceItem {
  title: string;
  expiryDatetime?: Date;
  nextAssignee: string;
  nextAssignee_title: string;
}

export interface SequenceListTemplate {
  name: string;
  sequence: SequenceItem[];
}
