export interface DmsObjectContent {
  contentStreamId: string;
  fileName: string;
  size: number;
  mimeType: string;
}
export interface DmsObjectRights {
  select: boolean;
  edit: boolean;
  delete: boolean;
  finalize: boolean;
  recycle: boolean;
}
export interface DmsObjectContext {
  id: string;
  objectTypeId: string;
  title: string;
  description: string;
}
