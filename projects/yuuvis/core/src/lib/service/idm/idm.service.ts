import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OrganizationSetEntry } from './idm.interface';

@Injectable({
  providedIn: 'root'
})
export class IdmService {
  constructor() {}

  queryOrganizationEntity(term: string, targetTypes: string[]): Observable<OrganizationSetEntry[]> {
    const dummyRes: OrganizationSetEntry[] = [
      { id: '1', title: 'User Nr1', type: 'user' },
      { id: '2', title: 'Role Nr2', type: 'role' },
      { id: '3', title: 'Role Nr3', type: 'role' },
      { id: '4', title: 'User Nr4', type: 'user' },
      { id: '5', title: 'Role Nr5', type: 'role' }
    ];
    return of(dummyRes.filter((e) => targetTypes.includes(e.type)));
  }
}
