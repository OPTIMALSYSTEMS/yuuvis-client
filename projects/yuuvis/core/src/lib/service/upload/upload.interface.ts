import { Observable, Subscription } from 'rxjs';
/**
 * Intrefice for providing an uploading status of an object
 */
export interface ProgressStatus {
  items: ProgressStatusItem[];
  err: number;
}
/**
 * Is part of the `ProgressStatus` interface
 */
export interface ProgressStatusItem {
  id: string;
  filename: string;
  progress: Observable<number>;
  subscription: Subscription;
  result?: UploadResult[];
  err?: {
    code: number;
    message: string;
  };
}
/**
 * is a part of `CreatedObject` interface
 */
interface ContentStream {
  contentStreamId: string;
  repositoryId: string;
  digest: string;
  fileName: string;
  archivePath: string;
  length: number;
  mimeType: string;
}
/**
 * Interface providng properties of uploaded object type
 */
export interface UploadResult {
  objectId: string | string[];
  contentStreamId: string;
  filename: string;
  label?: string;
}

/**
 * Interface that was used by upload service
 */
export interface CreatedObject {
  body?: {
    objects: {
      properties: any;
      contentStreams?: ContentStream[];
    }[];
  };
}
