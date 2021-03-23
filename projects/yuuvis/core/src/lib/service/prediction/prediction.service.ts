import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { PredictionClassifyResult } from './prediction.interface';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  constructor(private backend: BackendService) {}

  classify(objectID: string): Observable<PredictionClassifyResult> {
    return this.backend.get(`/predict/classification/${objectID}`, 'predict').pipe(
      map((res: any) => {
        // get matching prediction from response array (should be only only one but ...)
        const mp = res.predictions.find((p) => p['system:objectId']?.value === objectID);
        if (mp) {
          // map response from the prediction service to the internal response type
          const predictions = {};
          Object.keys(mp.properties).forEach((k) => (predictions[k] = { probability: mp.properties[k].probability }));
          return {
            id: mp.predictionId,
            objectId: mp['system:objectId'],
            predictions: predictions
          };
        } else {
          return null;
        }
      })
    );
  }
}
