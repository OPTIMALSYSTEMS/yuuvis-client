import { Observable, Subscription } from 'rxjs';

export interface ProgressStatus {
  items: ProgressStatusItem[];
  err: number;
}
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

interface ContentStream {
  contentStreamId: string;
  repositoryId: string;
  digest: string;
  fileName: string;
  archivePath: string;
  length: number;
  mimeType: string;
}

export interface UploadResult {
  objectId: string;
  contentStreamId: string;
  filename: string;
  label?: string;

  // contentStreams: ContentStream[];
  // properties: any;
}
