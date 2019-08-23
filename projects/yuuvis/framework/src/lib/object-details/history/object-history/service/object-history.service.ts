import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DmsObjectHistoryEntry } from '../model/dms-object-history.model';

@Injectable({
  providedIn: 'root'
})
export class ObjectHistoryService {
  constructor() {}

  objectHistory(id: string): Observable<DmsObjectHistoryEntry[]> {
    const history: any = [
      {
        time: '2019-04-12T14:00:24.330Z',
        group: 'MODIFICATION',
        version: 1,
        description: 'description',
        comment: 'comment',
        user: {
          lastname: 'lastname',
          firstname: 'firstname',
          name: 'name'
        },
        parameter: {
          processName: 'processName',
          activityName: 'activityName',
          type: 'bpm'
        }
      },
      {
        time: '2019-04-12T14:20:24.330Z',
        group: 'PROCESS',
        version: 1,
        description: 'description2',
        comment: 'comment2',
        user: {
          lastname: 'lastname2',
          firstname: 'firstname2',
          name: 'name2'
        },
        parameter: {
          processName: 'processName2',
          activityName: 'activityName2'
        }
      }
    ];

    return of(history);
  }
}
