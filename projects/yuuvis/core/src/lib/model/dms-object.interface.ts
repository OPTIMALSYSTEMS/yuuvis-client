export interface DmsObjectContent {
  contentStreamId: string;
  fileName: string;
  size: number;
  mimeType: string;
}
export interface DmsObjectRights {
  readIndexData: boolean;
  readContent: boolean;
  writeIndexData: boolean;
  writeContent: boolean;
  deleteObject: boolean;
  deleteContent: boolean;
}
export interface DmsObjectContext {
  id: string;
  objectTypeId: string;
  title: string;
  description: string;
}
