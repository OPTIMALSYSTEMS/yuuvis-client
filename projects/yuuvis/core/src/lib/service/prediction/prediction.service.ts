import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendService } from '../backend/backend.service';
import { Classification } from '../system/system.enum';
import { ObjectType } from '../system/system.interface';
import { SystemService } from '../system/system.service';
import { ApiBase } from './../backend/api.enum';
import { PredictionClassifyResult } from './prediction.interface';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  constructor(private backend: BackendService, private systemService: SystemService) {}

  classify(objectID: string): Observable<PredictionClassifyResult> {
    return this.backend.get(`/predict/classification/${objectID}`, ApiBase.predict).pipe(
      map((res: any) => {
        // get matching prediction from response array
        const mp = res.predictions.find((p) => p['system:objectId']?.value === objectID);
        if (mp) {
          // map response from the prediction service to the internal response type
          const predictions = this.mapPredictions(mp.properties);
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
  /**
   * Checks whether or not the given object type supports prediction api
   * @param objectTypeId Object type ID
   */
  supportsPrediction(objectTypeId: string): boolean {
    const ot: ObjectType = this.systemService.getObjectType(objectTypeId);
    return ot && ot.classification?.includes(Classification.PREDICTION_CLASSIFY);
  }

  private mapPredictions(properties: any): {
    [objectType: string]: [
      {
        probability: number;
        data?: any;
      }
    ];
  } {
    const predictions = {};

    Object.keys(properties).forEach((k) => {
      const tokens = k.split('|');
      const objectTypeKey = tokens.length ? tokens[0] : k;
      let data: any = {};
      if (tokens.length > 1) {
        data[tokens[1]] = tokens[2];
      } else {
        data = null;
      }

      if (!predictions[objectTypeKey]) predictions[objectTypeKey] = [];
      predictions[objectTypeKey].push({
        probability: properties[k].probability,
        data: data
      });
    });
    return predictions;
  }

  /**
   * Send feedback to the prediction API. This will help the service to be trained over time
   * and improve its predictions. So if you fetched a prediction you should also respond to
   * the service which item was choosen by the user.
   * @param predictionId ID of the prediction fetched earlier (... by calling classify() for example)
   * @param objectTypeId The object type ID choosen by the user
   */
  sendClassifyFeedback(predictionId: string, objectTypeId: string): void {
    const postData = {
      properties: {
        predictionId: {
          value: predictionId
        },
        feedbackData: {
          objectTypeId: {
            value: objectTypeId
          }
        }
      }
    };
    this.backend.post(`/predict/classification/feedback`, postData, ApiBase.predict).subscribe();
  }
}
