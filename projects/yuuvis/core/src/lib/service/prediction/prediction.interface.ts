export interface PredictionClassifyResult {
  // predictions instance ID
  id: string;
  /** the predictions for different object types
    /*
    **/
  predictions: { [objectType: string]: { probability: number } };
}
