export interface AuditEntry {
  action: number;
  detail: string;
  creationDate: Date;
  createdBy: {
    id: string;
    title: string;
  };
}

export interface AuditQueryOptions {
  from: Date;
  to?: Date;
}
