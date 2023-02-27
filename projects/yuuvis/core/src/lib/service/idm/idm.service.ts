import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { BackendService } from '../backend/backend.service';
import { OrganizationSetEntry } from './idm.interface';

@Injectable({
  providedIn: 'root'
})
export class IdmService {
  constructor(private backend: BackendService) {}

  queryOrganizationEntity(term: string, targetTypes: string[], size?: number): Observable<OrganizationSetEntry[]> {
    return this.backend.get(`/idm/search?search=${term}${size ? `&size=${size}` : ''}`).pipe(
      map((res) => [
        ...(targetTypes.includes('user')
          ? res.users.map((u) => ({
              id: u.id,
              title: `${u.lastname}, ${u.firstname} (${u.username})`, // TODO: u.title,
              type: 'user'
            }))
          : []),
        ...(targetTypes.includes('role')
          ? res.roles.map((u) => ({
              id: u.name,
              title: u.name,
              type: 'role'
            }))
          : [])
      ])
    );
  }
}
