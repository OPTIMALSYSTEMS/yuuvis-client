/**
 * Interface providing content for a dms object
 */
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
/**
 * Interface providing context for a dms object
 */
export interface DmsObjectContext {
  id: string;
  objectTypeId: string;
  title: string;
  description: string;
}
