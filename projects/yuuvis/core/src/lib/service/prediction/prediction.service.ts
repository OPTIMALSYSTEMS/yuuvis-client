import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from '../backend/backend.service';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  constructor(private backend: BackendService) {}

  classify(objectID: string): Observable<any> {
    return this.backend.get(`/predict/classification/${objectID}`, 'predict');
  }
}
