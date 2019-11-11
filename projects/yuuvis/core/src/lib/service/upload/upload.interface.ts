import { Observable, Subscription } from 'rxjs';

export interface ProgressStatus {
  items: ProgressStatusItem[];
  result?: CreateObjectResult[];
  err: number;
}
export interface ProgressStatusItem {
  id: string;
  filename: string;
  progress: Observable<number>;
  subscription: Subscription;
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

export interface CreateObjectResult {
  contentStreams: ContentStream[];
  properties: any;
}
