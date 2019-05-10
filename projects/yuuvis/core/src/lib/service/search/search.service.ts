import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from '../backend/backend.service';
import { ApiBase } from '../backend/api.enum';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private backend: BackendService) { }

  search(query: string): Observable<any> {
    const q = {
      "query": {
        "statement": query,
        "skipCount": 0,
        "maxItems": 50
      }
    }
    return this.backend.post('/dms/objects/search', q, ApiBase.core);
  }
}
