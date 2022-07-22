export interface SequenceItem {
  title: string;
  expiryDatetime?: Date;
  nextAssignee: string;
  nextAssignee_title: string;
}

export interface SequenceListTemplate {
  id: string;
  name: string;
  sequence: SequenceItem[];
}
export interface SequenceListTemplateSaveResponse {
  templateName: string;
}
