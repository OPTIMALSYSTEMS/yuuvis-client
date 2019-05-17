import { Subject } from 'rxjs';

export interface IAuthFlowService {
    openLoginUri(url: string, stopTrigger: Subject<void>);
    close();
}